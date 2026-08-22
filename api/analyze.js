import { fetchTranscript } from "../lib/apify.js";
import { analyzeTranscript } from "../lib/gemini.js";
import {
  isSupportedLanguage,
  languageFromAcceptLanguage,
  serverMessage,
} from "../lib/language.js";
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

function errorResponse(language, code, status, params = {}, extraHeaders = {}) {
  return jsonResponse(
    { ok: false, error: { code, message: serverMessage(language, code, params) } },
    status,
    extraHeaders,
  );
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
    const headerLanguage = languageFromAcceptLanguage(
      request.headers.get("accept-language"),
      "ru",
    );

    if (request.method !== "POST") {
      return errorResponse(
        headerLanguage,
        "METHOD_NOT_ALLOWED",
        405,
        {},
        { Allow: "POST" },
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_CHARACTERS) {
      return errorResponse(headerLanguage, "BODY_TOO_LARGE", 413);
    }

    const rateResult = rateLimiter.consume(getClientAddress(request));
    if (!rateResult.allowed) {
      return errorResponse(
        headerLanguage,
        "TOO_MANY_REQUESTS",
        429,
        { seconds: rateResult.retryAfterSeconds },
        { "Retry-After": String(rateResult.retryAfterSeconds) },
      );
    }

    let bodyText;
    try {
      bodyText = await request.text();
    } catch {
      return errorResponse(headerLanguage, "INVALID_BODY", 400);
    }

    if (bodyText.length > MAX_BODY_CHARACTERS) {
      return errorResponse(headerLanguage, "BODY_TOO_LARGE", 413);
    }

    let body;
    try {
      body = JSON.parse(bodyText || "{}");
    } catch {
      return errorResponse(headerLanguage, "INVALID_JSON", 400);
    }

    if (body?.language !== undefined && !isSupportedLanguage(body.language)) {
      return errorResponse(headerLanguage, "UNSUPPORTED_LANGUAGE", 400);
    }

    const language = body?.language || "ru";
    const video = parseYouTubeUrl(body?.youtubeUrl);
    if (!video) {
      return errorResponse(language, "INVALID_YOUTUBE_URL", 400);
    }

    if (!env.APIFY_API_TOKEN || !env.GEMINI_API_KEY) {
      return errorResponse(language, "SERVICE_NOT_CONFIGURED", 503);
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
        language,
      );

      return jsonResponse({
        ok: true,
        language,
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
        return errorResponse(language, error.code, error.status);
      }

      return errorResponse(language, "UNEXPECTED_ERROR", 500);
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
