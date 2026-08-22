import { buildAnalysisPrompt } from "./prompt.js";
import { PublicError, fetchWithTimeout } from "./service-error.js";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const GEMINI_MODEL = "gemini-3.7-flash";

function extractGeminiText(payload) {
  if (typeof payload?.output_text === "string") {
    return payload.output_text.trim();
  }

  if (!Array.isArray(payload?.steps)) {
    return "";
  }

  return payload.steps
    .filter((step) => step?.type === "model_output" && Array.isArray(step.content))
    .flatMap((step) => step.content)
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

async function logGeminiFailure(response) {
  let apiError = {};

  try {
    const payload = await response.json();
    if (payload?.error && typeof payload.error === "object") {
      apiError = payload.error;
    }
  } catch {
    // The HTTP status is still useful when Google returns a non-JSON response.
  }

  const message =
    typeof apiError.message === "string" ? apiError.message.slice(0, 500) : undefined;

  console.error("[gemini] request failed", {
    httpStatus: response.status,
    apiCode: apiError.code,
    apiStatus: apiError.status,
    message,
  });
}

export async function analyzeTranscript(fetchImpl, apiKey, preparedTranscript) {
  let response;
  try {
    response = await fetchWithTimeout(
      fetchImpl,
      GEMINI_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          store: false,
          input: buildAnalysisPrompt(preparedTranscript.text, {
            shortened: preparedTranscript.shortened,
          }),
        }),
      },
      60_000,
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new PublicError(
        504,
        "GEMINI_TIMEOUT",
        "Анализ занял слишком много времени. Попробуйте ещё раз.",
      );
    }
    throw new PublicError(
      502,
      "GEMINI_UNAVAILABLE",
      "Не удалось связаться с AI-моделью. Попробуйте позже.",
    );
  }

  if (!response.ok) {
    await logGeminiFailure(response);
    throw new PublicError(
      response.status === 429 ? 429 : 502,
      response.status === 429 ? "GEMINI_RATE_LIMIT" : "GEMINI_ERROR",
      response.status === 429
        ? "Лимит AI-анализа временно исчерпан. Попробуйте позже."
        : "AI-модель не смогла выполнить анализ. Попробуйте другой ролик.",
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new PublicError(502, "GEMINI_BAD_RESPONSE", "AI-модель вернула некорректный ответ.");
  }

  const analysis = extractGeminiText(payload);
  if (!analysis) {
    throw new PublicError(502, "GEMINI_EMPTY_RESPONSE", "AI-модель вернула пустой ответ.");
  }

  return analysis;
}

