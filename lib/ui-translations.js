import { normalizeLanguage } from "./language.js";

export const UI_TRANSLATIONS = {
  ru: {
    locale: "ru-RU",
    metaTitle: "VideoCompass AI — разбор YouTube-видео",
    metaDescription:
      "VideoCompass AI получает транскрипт YouTube-видео через Apify и превращает его в понятный разбор с помощью Gemini.",
    ogDescription: "Понятный AI-разбор YouTube-видео по транскрипту.",
    skipLink: "Перейти к анализатору",
    brandHome: "VideoCompass AI — на главную",
    tagline: "Экономьте время на просмотре",
    languageGroup: "Выбор языка",
    heroEyebrow: "Смотрите осознанно",
    heroTitle: "Краткое содержание и обзор YouTube-видео",
    heroLead:
      "Вставьте ссылку — сервис получит доступные субтитры, выделит главное, оценит пользу ролика и предложит практические действия.",
    benefitsLabel: "Преимущества сервиса",
    benefitSummary: "Краткое резюме",
    benefitScore: "Оценка пользы",
    benefitQuestions: "Вопросы для самопроверки",
    heroFrom: "От ссылки",
    heroTo: "к ясному выводу",
    analyzerTitle: "Ссылка на видео",
    analyzerSupport: "Поддерживаются обычные ролики, Shorts и записи трансляций.",
    urlLabel: "YouTube‑ссылка",
    analyzeButton: "Проанализировать",
    urlHelp: "Видео должно быть публичным и иметь ручные или автоматические субтитры.",
    progressOne: "Проверяем ссылку…",
    progressTwo: "Получаем доступные субтитры…",
    progressThree: "Gemini выделяет главное…",
    progressStepsLabel: "Этапы анализа",
    progressStepOne: "Проверка YouTube‑ссылки",
    progressStepTwo: "Получение транскрипта через Apify",
    progressStepThree: "Анализ текста с помощью Gemini",
    resultTitle: "Результат анализа",
    analysisHint: "Нажмите на заголовок, чтобы свернуть или раскрыть раздел.",
    analysisControls: "Управление разделами анализа",
    collapseAll: "Свернуть все",
    expandAll: "Раскрыть все",
    copyButton: "Скопировать",
    videoAlt: "Превью проанализированного YouTube-видео",
    sourceVideo: "Исходное видео",
    openYouTube: "Открыть на YouTube ↗",
    newAnalysis: "← Проанализировать другое видео",
    processEyebrow: "Прозрачный процесс",
    processTitle: "Как это работает",
    processOneTitle: "Проверяем ссылку",
    processOneText: "Принимаем только одну корректную ссылку на публичный YouTube‑ролик.",
    processTwoTitle: "Получаем текст",
    processTwoText:
      "Apify извлекает доступные субтитры, не передавая секретный ключ браузеру.",
    processThreeTitle: "Выделяем главное",
    processThreeText: "Gemini анализирует транскрипт по единому проверяемому шаблону.",
    footerProject: "VideoCompass AI · учебный некоммерческий проект",
    footerDisclaimer:
      "Результат AI может содержать неточности — сверяйте важные выводы с оригиналом.",
    invalidUrl: "Вставьте полную ссылку на YouTube, например https://youtu.be/…",
    analyzing: "Анализируем…",
    repeat: ({ seconds }) => `Повтор через ${seconds} сек.`,
    characters: ({ count }) => `${count} знаков в транскрипте`,
    shortened: "для анализа использованы начало, середина и конец",
    analysisReady: "Анализ готов",
    invalidResponse: "Сервер вернул некорректный ответ. Попробуйте позже.",
    analysisFailed: "Не удалось выполнить анализ.",
    timeout: "Анализ занял слишком много времени. Попробуйте ещё раз.",
    network: "Не удалось связаться с сервером. Проверьте интернет и повторите попытку.",
    unexpected: "Произошла непредвиденная ошибка.",
    copied: "Скопировано",
    copyFailed: "Не удалось скопировать",
  },
  en: {
    locale: "en-US",
    metaTitle: "VideoCompass AI — YouTube video analysis",
    metaDescription:
      "VideoCompass AI retrieves a YouTube transcript through Apify and turns it into a clear analysis with Gemini.",
    ogDescription: "A clear AI analysis of a YouTube video based on its transcript.",
    skipLink: "Skip to the analyzer",
    brandHome: "VideoCompass AI — home",
    tagline: "Save time watching",
    languageGroup: "Language selection",
    heroEyebrow: "Watch with purpose",
    heroTitle: "YouTube video summary and review",
    heroLead:
      "Paste a link — the service retrieves available subtitles, highlights the main points, rates the video's value, and suggests practical actions.",
    benefitsLabel: "Service benefits",
    benefitSummary: "Brief summary",
    benefitScore: "Value score",
    benefitQuestions: "Self-check questions",
    heroFrom: "From a link",
    heroTo: "to a clear conclusion",
    analyzerTitle: "Video link",
    analyzerSupport: "Regular videos, Shorts, and recorded live streams are supported.",
    urlLabel: "YouTube link",
    analyzeButton: "Analyze",
    urlHelp: "The video must be public and have manual or automatic subtitles.",
    progressOne: "Checking the link…",
    progressTwo: "Retrieving available subtitles…",
    progressThree: "Gemini is identifying the main points…",
    progressStepsLabel: "Analysis stages",
    progressStepOne: "Checking the YouTube link",
    progressStepTwo: "Retrieving the transcript through Apify",
    progressStepThree: "Analyzing the text with Gemini",
    resultTitle: "Analysis result",
    analysisHint: "Select a heading to collapse or expand a section.",
    analysisControls: "Analysis section controls",
    collapseAll: "Collapse all",
    expandAll: "Expand all",
    copyButton: "Copy",
    videoAlt: "Preview of the analyzed YouTube video",
    sourceVideo: "Original video",
    openYouTube: "Open on YouTube ↗",
    newAnalysis: "← Analyze another video",
    processEyebrow: "A transparent process",
    processTitle: "How it works",
    processOneTitle: "We check the link",
    processOneText: "Only one valid link to a public YouTube video is accepted.",
    processTwoTitle: "We retrieve the text",
    processTwoText:
      "Apify retrieves available subtitles without exposing the secret key to the browser.",
    processThreeTitle: "We identify what matters",
    processThreeText: "Gemini analyzes the transcript using one consistent, testable template.",
    footerProject: "VideoCompass AI · educational non-commercial project",
    footerDisclaimer:
      "AI results may contain inaccuracies — verify important conclusions against the original.",
    invalidUrl: "Enter a full YouTube link, for example https://youtu.be/…",
    analyzing: "Analyzing…",
    repeat: ({ seconds }) => `Retry in ${seconds} sec.`,
    characters: ({ count }) => `${count} transcript characters`,
    shortened: "the beginning, middle, and end were used for analysis",
    analysisReady: "Analysis ready",
    invalidResponse: "The server returned an invalid response. Please try again later.",
    analysisFailed: "The analysis could not be completed.",
    timeout: "The analysis took too long. Please try again.",
    network: "The server could not be reached. Check your connection and try again.",
    unexpected: "An unexpected error occurred.",
    copied: "Copied",
    copyFailed: "Could not copy",
  },
  lv: {
    locale: "lv-LV",
    metaTitle: "VideoCompass AI — YouTube video analīze",
    metaDescription:
      "VideoCompass AI iegūst YouTube transkriptu ar Apify un pārvērš to saprotamā analīzē ar Gemini.",
    ogDescription: "Saprotama YouTube video AI analīze, izmantojot transkriptu.",
    skipLink: "Pāriet uz analizatoru",
    brandHome: "VideoCompass AI — sākumlapa",
    tagline: "Ietaupiet laiku skatoties",
    languageGroup: "Valodas izvēle",
    heroEyebrow: "Skatieties apzināti",
    heroTitle: "YouTube video kopsavilkums un apskats",
    heroLead:
      "Ievietojiet saiti — pakalpojums iegūs pieejamos subtitrus, izcels galveno, novērtēs video lietderību un ieteiks praktiskas darbības.",
    benefitsLabel: "Pakalpojuma priekšrocības",
    benefitSummary: "Īss kopsavilkums",
    benefitScore: "Lietderības vērtējums",
    benefitQuestions: "Pašpārbaudes jautājumi",
    heroFrom: "No saites",
    heroTo: "līdz skaidram secinājumam",
    analyzerTitle: "Video saite",
    analyzerSupport: "Tiek atbalstīti parastie video, Shorts un tiešraižu ieraksti.",
    urlLabel: "YouTube saite",
    analyzeButton: "Analizēt",
    urlHelp: "Video jābūt publiskam, un tam jābūt manuāliem vai automātiskiem subtitriem.",
    progressOne: "Saite tiek pārbaudīta…",
    progressTwo: "Tiek iegūti pieejamie subtitri…",
    progressThree: "Gemini izceļ galveno…",
    progressStepsLabel: "Analīzes posmi",
    progressStepOne: "YouTube saites pārbaude",
    progressStepTwo: "Transkripta iegūšana ar Apify",
    progressStepThree: "Teksta analīze ar Gemini",
    resultTitle: "Analīzes rezultāts",
    analysisHint: "Nospiediet virsrakstu, lai sakļautu vai izvērstu sadaļu.",
    analysisControls: "Analīzes sadaļu vadība",
    collapseAll: "Sakļaut visu",
    expandAll: "Izvērst visu",
    copyButton: "Kopēt",
    videoAlt: "Analizētā YouTube video priekšskatījums",
    sourceVideo: "Sākotnējais video",
    openYouTube: "Atvērt YouTube ↗",
    newAnalysis: "← Analizēt citu video",
    processEyebrow: "Caurspīdīgs process",
    processTitle: "Kā tas darbojas",
    processOneTitle: "Pārbaudām saiti",
    processOneText: "Tiek pieņemta tikai viena derīga saite uz publisku YouTube video.",
    processTwoTitle: "Iegūstam tekstu",
    processTwoText:
      "Apify iegūst pieejamos subtitrus, neatklājot pārlūkprogrammai slepeno atslēgu.",
    processThreeTitle: "Izceļam galveno",
    processThreeText: "Gemini analizē transkriptu pēc vienotas, pārbaudāmas veidnes.",
    footerProject: "VideoCompass AI · mācību bezpeļņas projekts",
    footerDisclaimer:
      "AI rezultātā var būt neprecizitātes — svarīgus secinājumus pārbaudiet oriģinālā.",
    invalidUrl: "Ievietojiet pilnu YouTube saiti, piemēram, https://youtu.be/…",
    analyzing: "Notiek analīze…",
    repeat: ({ seconds }) => `Atkārtot pēc ${seconds} sek.`,
    characters: ({ count }) => `${count} rakstzīmes transkriptā`,
    shortened: "analīzei izmantots sākums, vidus un beigas",
    analysisReady: "Analīze gatava",
    invalidResponse: "Serveris atgrieza nederīgu atbildi. Mēģiniet vēlreiz vēlāk.",
    analysisFailed: "Analīzi neizdevās pabeigt.",
    timeout: "Analīze aizņēma pārāk ilgu laiku. Mēģiniet vēlreiz.",
    network: "Neizdevās sazināties ar serveri. Pārbaudiet savienojumu un mēģiniet vēlreiz.",
    unexpected: "Radās neparedzēta kļūda.",
    copied: "Nokopēts",
    copyFailed: "Neizdevās nokopēt",
  },
};

export function detectPreferredLanguage({
  forcedLanguage,
  storedLanguage,
  browserLanguages = [],
} = {}) {
  const forced = normalizeLanguage(forcedLanguage);
  if (forced) {
    return forced;
  }

  const stored = normalizeLanguage(storedLanguage);
  if (stored) {
    return stored;
  }

  for (const value of browserLanguages) {
    const language = normalizeLanguage(value);
    if (language) {
      return language;
    }
  }

  return "en";
}

export function uiText(language, key, params = {}) {
  const dictionary = UI_TRANSLATIONS[normalizeLanguage(language) || "en"];
  const value = dictionary[key];
  return typeof value === "function" ? value(params) : value;
}

