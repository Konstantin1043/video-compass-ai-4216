export const SUPPORTED_LANGUAGES = Object.freeze(["ru", "en", "lv"]);

const SUPPORTED_LANGUAGE_SET = new Set(SUPPORTED_LANGUAGES);

export function normalizeLanguage(value) {
  if (typeof value !== "string") {
    return null;
  }

  const language = value.trim().toLowerCase().split("-")[0];
  return SUPPORTED_LANGUAGE_SET.has(language) ? language : null;
}

export function isSupportedLanguage(value) {
  return typeof value === "string" && SUPPORTED_LANGUAGE_SET.has(value);
}

export function languageFromAcceptLanguage(header, fallback = "ru") {
  if (typeof header === "string") {
    for (const item of header.split(",")) {
      const language = normalizeLanguage(item.split(";")[0]);
      if (language) {
        return language;
      }
    }
  }

  return normalizeLanguage(fallback) || "ru";
}

const SERVER_MESSAGES = {
  ru: {
    METHOD_NOT_ALLOWED: "Используйте POST-запрос.",
    BODY_TOO_LARGE: "Запрос слишком большой.",
    INVALID_BODY: "Не удалось прочитать запрос.",
    INVALID_JSON: "Некорректный формат запроса.",
    UNSUPPORTED_LANGUAGE: "Выберите русский, английский или латышский язык.",
    TOO_MANY_REQUESTS: ({ seconds }) =>
      `Слишком много запросов. Повторите через ${seconds} сек.`,
    INVALID_YOUTUBE_URL: "Вставьте ссылку на один ролик YouTube, Shorts или Live.",
    SERVICE_NOT_CONFIGURED: "Сервис ещё не подключён к API. Сообщите владельцу сайта.",
    UNEXPECTED_ERROR: "Произошла непредвиденная ошибка. Попробуйте позже.",
    APIFY_TIMEOUT: "YouTube слишком долго отвечал. Попробуйте ещё раз через минуту.",
    APIFY_UNAVAILABLE: "Не удалось связаться с сервисом транскриптов. Попробуйте позже.",
    APIFY_CONFIGURATION: "Сервис транскриптов временно не настроен. Сообщите владельцу сайта.",
    APIFY_RATE_LIMIT: "Лимит получения транскриптов временно исчерпан. Попробуйте позже.",
    APIFY_ERROR: "Не удалось получить транскрипт этого видео.",
    APIFY_BAD_RESPONSE: "Сервис транскриптов вернул некорректный ответ.",
    TRANSCRIPT_NOT_FOUND:
      "У ролика нет доступных субтитров или видео закрыто. Выберите публичный ролик с субтитрами.",
    GEMINI_TIMEOUT: "Анализ занял слишком много времени. Попробуйте ещё раз.",
    GEMINI_UNAVAILABLE: "Не удалось связаться с AI-моделью. Попробуйте позже.",
    GEMINI_BAD_RESPONSE: "AI-модель вернула некорректный ответ.",
    GEMINI_EMPTY_RESPONSE: "AI-модель вернула пустой ответ.",
    GEMINI_RATE_LIMIT:
      "Все доступные AI-модели достигли бесплатного лимита. Повторите попытку позже.",
    GEMINI_BUSY: "AI-модели временно перегружены. Повторите через минуту.",
    GEMINI_ERROR: "AI-модель не смогла выполнить анализ. Попробуйте другой ролик.",
  },
  en: {
    METHOD_NOT_ALLOWED: "Use a POST request.",
    BODY_TOO_LARGE: "The request is too large.",
    INVALID_BODY: "The request could not be read.",
    INVALID_JSON: "The request format is invalid.",
    UNSUPPORTED_LANGUAGE: "Choose Russian, English, or Latvian.",
    TOO_MANY_REQUESTS: ({ seconds }) =>
      `Too many requests. Try again in ${seconds} sec.`,
    INVALID_YOUTUBE_URL: "Enter a link to one YouTube video, Short, or Live recording.",
    SERVICE_NOT_CONFIGURED: "The API services are not configured yet. Contact the site owner.",
    UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
    APIFY_TIMEOUT: "YouTube took too long to respond. Try again in a minute.",
    APIFY_UNAVAILABLE: "The transcript service could not be reached. Please try again later.",
    APIFY_CONFIGURATION: "The transcript service is not configured correctly. Contact the site owner.",
    APIFY_RATE_LIMIT: "The transcript limit has been reached temporarily. Please try again later.",
    APIFY_ERROR: "The transcript for this video could not be retrieved.",
    APIFY_BAD_RESPONSE: "The transcript service returned an invalid response.",
    TRANSCRIPT_NOT_FOUND:
      "No subtitles are available or the video is private. Choose a public video with subtitles.",
    GEMINI_TIMEOUT: "The analysis took too long. Please try again.",
    GEMINI_UNAVAILABLE: "The AI model could not be reached. Please try again later.",
    GEMINI_BAD_RESPONSE: "The AI model returned an invalid response.",
    GEMINI_EMPTY_RESPONSE: "The AI model returned an empty response.",
    GEMINI_RATE_LIMIT:
      "All available AI models have reached their free limits. Please try again later.",
    GEMINI_BUSY: "The AI models are temporarily overloaded. Try again in a minute.",
    GEMINI_ERROR: "The AI model could not complete the analysis. Try another video.",
  },
  lv: {
    METHOD_NOT_ALLOWED: "Izmantojiet POST pieprasījumu.",
    BODY_TOO_LARGE: "Pieprasījums ir pārāk liels.",
    INVALID_BODY: "Pieprasījumu neizdevās nolasīt.",
    INVALID_JSON: "Pieprasījuma formāts nav derīgs.",
    UNSUPPORTED_LANGUAGE: "Izvēlieties krievu, angļu vai latviešu valodu.",
    TOO_MANY_REQUESTS: ({ seconds }) =>
      `Pārāk daudz pieprasījumu. Mēģiniet vēlreiz pēc ${seconds} sek.`,
    INVALID_YOUTUBE_URL: "Ievietojiet saiti uz vienu YouTube video, Short vai tiešraides ierakstu.",
    SERVICE_NOT_CONFIGURED: "API pakalpojumi vēl nav konfigurēti. Sazinieties ar vietnes īpašnieku.",
    UNEXPECTED_ERROR: "Radās neparedzēta kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.",
    APIFY_TIMEOUT: "YouTube atbilde aizņēma pārāk ilgu laiku. Mēģiniet vēlreiz pēc minūtes.",
    APIFY_UNAVAILABLE: "Neizdevās sazināties ar transkripta pakalpojumu. Mēģiniet vēlreiz vēlāk.",
    APIFY_CONFIGURATION:
      "Transkripta pakalpojums nav pareizi konfigurēts. Sazinieties ar vietnes īpašnieku.",
    APIFY_RATE_LIMIT: "Transkriptu limits īslaicīgi ir sasniegts. Mēģiniet vēlreiz vēlāk.",
    APIFY_ERROR: "Neizdevās iegūt šī video transkriptu.",
    APIFY_BAD_RESPONSE: "Transkripta pakalpojums atgrieza nederīgu atbildi.",
    TRANSCRIPT_NOT_FOUND:
      "Subtitri nav pieejami vai video ir privāts. Izvēlieties publisku video ar subtitriem.",
    GEMINI_TIMEOUT: "Analīze aizņēma pārāk ilgu laiku. Mēģiniet vēlreiz.",
    GEMINI_UNAVAILABLE: "Neizdevās sazināties ar AI modeli. Mēģiniet vēlreiz vēlāk.",
    GEMINI_BAD_RESPONSE: "AI modelis atgrieza nederīgu atbildi.",
    GEMINI_EMPTY_RESPONSE: "AI modelis atgrieza tukšu atbildi.",
    GEMINI_RATE_LIMIT:
      "Visi pieejamie AI modeļi ir sasnieguši bezmaksas limitu. Mēģiniet vēlreiz vēlāk.",
    GEMINI_BUSY: "AI modeļi pašlaik ir pārslogoti. Mēģiniet vēlreiz pēc minūtes.",
    GEMINI_ERROR: "AI modelis nevarēja pabeigt analīzi. Izmēģiniet citu video.",
  },
};

export function serverMessage(language, code, params = {}) {
  const dictionary = SERVER_MESSAGES[normalizeLanguage(language) || "ru"];
  const value = dictionary[code] ?? dictionary.UNEXPECTED_ERROR;
  return typeof value === "function" ? value(params) : value;
}
