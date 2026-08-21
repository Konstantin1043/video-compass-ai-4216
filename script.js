const form = document.querySelector("#analyzerForm");
const urlInput = document.querySelector("#youtubeUrl");
const submitButton = document.querySelector("#submitButton");
const submitButtonLabel = submitButton.querySelector("span");
const errorMessage = document.querySelector("#errorMessage");
const errorText = document.querySelector("#errorText");
const progressPanel = document.querySelector("#progressPanel");
const progressTitle = document.querySelector("#progressTitle");
const progressSteps = [
  document.querySelector("#progressStep1"),
  document.querySelector("#progressStep2"),
  document.querySelector("#progressStep3"),
];
const result = document.querySelector("#result");
const videoThumbnail = document.querySelector("#videoThumbnail");
const videoLink = document.querySelector("#videoLink");
const transcriptMeta = document.querySelector("#transcriptMeta");
const analysisText = document.querySelector("#analysisText");
const copyButton = document.querySelector("#copyButton");
const newAnalysisButton = document.querySelector("#newAnalysisButton");

let cooldownTimer = null;

function looksLikeYouTubeUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      ["youtu.be", "youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(
        host,
      ) && ["http:", "https:"].includes(url.protocol)
    );
  } catch {
    return false;
  }
}

function showError(message) {
  errorText.textContent = message;
  errorMessage.hidden = false;
  urlInput.setAttribute("aria-invalid", "true");
}

function clearError() {
  errorText.textContent = "";
  errorMessage.hidden = true;
  urlInput.removeAttribute("aria-invalid");
}

function updateProgress(activeIndex) {
  const titles = [
    "Проверяем ссылку…",
    "Получаем доступные субтитры…",
    "Gemini выделяет главное…",
  ];
  progressTitle.textContent = titles[Math.min(activeIndex, titles.length - 1)];

  progressSteps.forEach((step, index) => {
    step.classList.toggle("is-done", index < activeIndex);
    step.classList.toggle("is-active", index === activeIndex);
  });
}

function startCooldown(seconds = 5) {
  clearInterval(cooldownTimer);
  let remaining = seconds;
  submitButton.disabled = true;
  submitButtonLabel.textContent = `Повтор через ${remaining} сек.`;

  cooldownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(cooldownTimer);
      submitButton.disabled = false;
      submitButtonLabel.textContent = "Проанализировать";
      return;
    }
    submitButtonLabel.textContent = `Повтор через ${remaining} сек.`;
  }, 1_000);
}

function formatCharacters(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function renderResult(payload) {
  videoThumbnail.src = payload.video.thumbnailUrl;
  videoThumbnail.alt = "Превью проанализированного YouTube-видео";
  videoLink.href = payload.video.canonicalUrl;
  analysisText.textContent = payload.analysis;

  const metaParts = [
    `${formatCharacters(payload.transcript.originalCharacters)} знаков в транскрипте`,
  ];
  if (payload.transcript.shortened) {
    metaParts.push("для анализа использованы начало, середина и конец");
  }
  transcriptMeta.textContent = metaParts.join(" · ");

  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const youtubeUrl = urlInput.value.trim();
  if (!looksLikeYouTubeUrl(youtubeUrl)) {
    showError("Вставьте полную ссылку на YouTube, например https://youtu.be/…");
    urlInput.focus();
    return;
  }

  result.hidden = true;
  progressPanel.hidden = false;
  form.setAttribute("aria-busy", "true");
  submitButton.disabled = true;
  submitButtonLabel.textContent = "Анализируем…";
  updateProgress(0);

  const stageTwoTimer = setTimeout(() => updateProgress(1), 700);
  const stageThreeTimer = setTimeout(() => updateProgress(2), 4_500);
  const controller = new AbortController();
  const requestTimeout = setTimeout(() => controller.abort(), 125_000);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl }),
      signal: controller.signal,
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Сервер вернул некорректный ответ. Попробуйте позже.");
    }

    if (!response.ok || !payload.ok) {
      throw new Error(payload?.error?.message || "Не удалось выполнить анализ.");
    }

    progressSteps.forEach((step) => {
      step.classList.remove("is-active");
      step.classList.add("is-done");
    });
    progressTitle.textContent = "Анализ готов";
    renderResult(payload);
  } catch (error) {
    if (error?.name === "AbortError") {
      showError("Анализ занял слишком много времени. Попробуйте ещё раз.");
    } else {
      showError(error?.message || "Произошла непредвиденная ошибка.");
    }
  } finally {
    clearTimeout(stageTwoTimer);
    clearTimeout(stageThreeTimer);
    clearTimeout(requestTimeout);
    progressPanel.hidden = true;
    form.removeAttribute("aria-busy");
    startCooldown();
  }
});

urlInput.addEventListener("input", clearError);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(analysisText.textContent);
    copyButton.textContent = "Скопировано";
    setTimeout(() => {
      copyButton.textContent = "Скопировать";
    }, 1_800);
  } catch {
    copyButton.textContent = "Не удалось скопировать";
  }
});

newAnalysisButton.addEventListener("click", () => {
  result.hidden = true;
  urlInput.value = "";
  urlInput.focus();
  document.querySelector("#analyzer").scrollIntoView({ behavior: "smooth" });
});

