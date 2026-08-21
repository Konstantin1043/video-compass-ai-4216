import { fetchTranscript } from "../lib/apify.js";
import { analyzeTranscript } from "../lib/gemini.js";
import { PublicError } from "../lib/service-error.js";
import { prepareTranscript } from "../lib/transcript.js";
import { parseYouTubeUrl } from "../lib/youtube.js";

const MAX_BODY_CHARACTERS = 2_048;

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function getClientAddress(request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

export function createRateLimiter({ limit = 3, windowMs = 60_000, now = Date.now } = {}) {
  const clients = new Map();

  return {
    consume(key) {
      const currentTime = now();
      const active = (clients.get(key) || []).filter(
        (timestamp) => currentTime - timestamp < windowMs,
      );

      if (active.length >= limit) {
        const retryAfterMs = windowMs - (currentTime - active[0]);
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
        };
      }

      active.push(currentTime);
      clients.set(key, active);

      if (clients.size > 500) {
        for (const [clientKey, timestamps] of clients) {
          if (timestamps.every((timestamp) => currentTime - timestamp >= windowMs)) {
            clients.delete(clientKey);
          }
        }
      }

      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

export function createAnalyzeHandler({
  env = process.env,
  fetchImpl = globalThis.fetch,
  rateLimiter = createRateLimiter(),
} = {}) {
  return async function handleAnalyze(request) {
    if (request.method !== "POST") {
      return jsonResponse(
        { ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "Используйте POST-запрос." } },
        405,
        { Allow: "POST" },
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_CHARACTERS) {
      return jsonResponse(
        { ok: false, error: { code: "BODY_TOO_LARGE", message: "Запрос слишком большой." } },
        413,
      );
    }

    const rateResult = rateLimiter.consume(getClientAddress(request));
    if (!rateResult.allowed) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: `Слишком много запросов. Повторите через ${rateResult.retryAfterSeconds} сек.`,
          },
        },
        429,
        { "Retry-After": String(rateResult.retryAfterSeconds) },
      );
    }

    let bodyText;
    try {
      bodyText = await request.text();
    } catch {
      return jsonResponse(
        { ok: false, error: { code: "INVALID_BODY", message: "Не удалось прочитать запрос." } },
        400,
      );
    }

    if (bodyText.length > MAX_BODY_CHARACTERS) {
      return jsonResponse(
        { ok: false, error: { code: "BODY_TOO_LARGE", message: "Запрос слишком большой." } },
        413,
      );
    }

    let body;
    try {
      body = JSON.parse(bodyText || "{}");
    } catch {
      return jsonResponse(
        { ok: false, error: { code: "INVALID_JSON", message: "Некорректный формат запроса." } },
        400,
      );
    }

    const video = parseYouTubeUrl(body?.youtubeUrl);
    if (!video) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: "INVALID_YOUTUBE_URL",
            message: "Вставьте ссылку на один ролик YouTube, Shorts или Live.",
          },
        },
        400,
      );
    }

    if (!env.APIFY_API_TOKEN || !env.GEMINI_API_KEY) {
      return jsonResponse(
        {
          ok: false,
          error: {
            code: "SERVICE_NOT_CONFIGURED",
            message: "Сервис ещё не подключён к API. Сообщите владельцу сайта.",
          },
        },
        503,
      );
    }

    try {
      const transcript = await fetchTranscript(
        fetchImpl,
        env.APIFY_API_TOKEN,
        video.canonicalUrl,
      );
      const preparedTranscript = prepareTranscript(transcript);
      const analysis = await analyzeTranscript(
        fetchImpl,
        env.GEMINI_API_KEY,
        preparedTranscript,
      );

      return jsonResponse({
        ok: true,
        video,
        analysis,
        transcript: {
          originalCharacters: preparedTranscript.originalCharacters,
          sentCharacters: preparedTranscript.sentCharacters,
          shortened: preparedTranscript.shortened,
        },
      });
    } catch (error) {
      if (error instanceof PublicError) {
        return jsonResponse(
          { ok: false, error: { code: error.code, message: error.message } },
          error.status,
        );
      }

      return jsonResponse(
        {
          ok: false,
          error: {
            code: "UNEXPECTED_ERROR",
            message: "Произошла непредвиденная ошибка. Попробуйте позже.",
          },
        },
        500,
      );
    }
  };
}

const handler = createAnalyzeHandler();

export const maxDuration = 120;

export default {
  fetch(request) {
    return handler(request);
  },
};

