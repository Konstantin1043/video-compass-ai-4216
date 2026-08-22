import assert from "node:assert/strict";
import test from "node:test";
import { createAnalyzeHandler, createRateLimiter } from "../api/analyze.js";

function request(body, method = "POST") {
  return new Request("http://localhost/api/analyze", {
    method,
    headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function handlerWith(options = {}) {
  return createAnalyzeHandler({
    env: options.env || {},
    fetchImpl: options.fetchImpl || (async () => assert.fail("Внешний API не должен вызываться")),
    rateLimiter: createRateLimiter({ limit: 100 }),
  });
}

test("отклоняет неподдерживаемый HTTP-метод", async () => {
  const response = await handlerWith()(request({}, "GET"));
  assert.equal(response.status, 405);
});

test("проверяет YouTube-ссылку до обращения к API", async () => {
  const response = await handlerWith()(request({ youtubeUrl: "https://example.com/video" }));
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "INVALID_YOUTUBE_URL");
});

test("понятно сообщает об отсутствующих серверных переменных", async () => {
  const response = await handlerWith()(
    request({ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" }),
  );
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.error.code, "SERVICE_NOT_CONFIGURED");
});

test("полный поток Apify → Gemini возвращает результат интерфейсу", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });

    if (String(url).includes("api.apify.com")) {
      return Response.json([
        { transcript_only_text: "Это тестовый транскрипт полезного видео." },
      ]);
    }

    return Response.json({
      candidates: [
        {
          content: {
            parts: [{ text: "1. О ЧЁМ ВИДЕО\nТестовый анализ." }],
          },
        },
      ],
    });
  };
  const handler = handlerWith({
    env: { APIFY_API_TOKEN: "apify-secret", GEMINI_API_KEY: "gemini-secret" },
    fetchImpl,
  });

  const response = await handler(
    request({ youtubeUrl: "https://youtube.com/shorts/dQw4w9WgXcQ" }),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.video.videoId, "dQw4w9WgXcQ");
  assert.match(payload.analysis, /Тестовый анализ/);
  assert.equal(payload.transcript.shortened, false);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.headers.Authorization, "Bearer apify-secret");
  assert.equal(calls[1].options.headers["x-goog-api-key"], "gemini-secret");
  assert.match(calls[1].url, /models\/gemini-3\.7-flash:generateContent$/);
  const geminiBody = JSON.parse(calls[1].options.body);
  assert.match(geminiBody.contents[0].parts[0].text, /тестовый транскрипт/i);
  assert.doesNotMatch(calls[0].url, /apify-secret/);
});

test("один раз повторяет Gemini-запрос при временной перегрузке", async () => {
  let geminiCalls = 0;
  const handler = handlerWith({
    env: { APIFY_API_TOKEN: "token", GEMINI_API_KEY: "key" },
    fetchImpl: async (url) => {
      if (String(url).includes("api.apify.com")) {
        return Response.json([{ transcript_only_text: "Тестовый транскрипт." }]);
      }

      geminiCalls += 1;
      if (geminiCalls === 1) {
        return Response.json(
          { error: { code: 503, status: "UNAVAILABLE", message: "High demand" } },
          { status: 503 },
        );
      }

      return Response.json({
        candidates: [{ content: { parts: [{ text: "Анализ после повтора." }] } }],
      });
    },
  });

  const response = await handler(
    request({ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" }),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(geminiCalls, 2);
  assert.match(payload.analysis, /после повтора/i);
});

test("возвращает понятную ошибку, если субтитры отсутствуют", async () => {
  const handler = handlerWith({
    env: { APIFY_API_TOKEN: "token", GEMINI_API_KEY: "key" },
    fetchImpl: async () => Response.json([]),
  });
  const response = await handler(
    request({ youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }),
  );
  const payload = await response.json();

  assert.equal(response.status, 422);
  assert.equal(payload.error.code, "TRANSCRIPT_NOT_FOUND");
});

test("ограничивает частоту повторных запросов", async () => {
  let currentTime = 1_000;
  const limiter = createRateLimiter({
    limit: 1,
    windowMs: 10_000,
    now: () => currentTime,
  });
  const handler = createAnalyzeHandler({ env: {}, rateLimiter: limiter });

  const first = await handler(request({ youtubeUrl: "не ссылка" }));
  assert.equal(first.status, 400);

  const second = await handler(request({ youtubeUrl: "не ссылка" }));
  assert.equal(second.status, 429);

  currentTime += 10_001;
  const third = await handler(request({ youtubeUrl: "не ссылка" }));
  assert.equal(third.status, 400);
});

