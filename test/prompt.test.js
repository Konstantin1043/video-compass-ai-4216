import assert from "node:assert/strict";
import test from "node:test";
import { buildAnalysisPrompt } from "../lib/prompt.js";

const HEADINGS = {
  ru: [
    "О ЧЁМ ВИДЕО",
    "КРАТКОЕ РЕЗЮМЕ",
    "КЛЮЧЕВЫЕ ИДЕИ И ФАКТЫ",
    "КОМУ БУДЕТ ПОЛЕЗНО",
    "СТОИТ ЛИ СМОТРЕТЬ",
    "ЧТО МОЖНО ПРИМЕНИТЬ",
    "ЧТО ВЫЗЫВАЕТ СОМНЕНИЯ",
    "ВОПРОСЫ ДЛЯ САМОПРОВЕРКИ",
  ],
  en: [
    "WHAT THE VIDEO IS ABOUT",
    "BRIEF SUMMARY",
    "KEY IDEAS AND FACTS",
    "WHO WILL BENEFIT",
    "IS IT WORTH WATCHING",
    "PRACTICAL ACTIONS",
    "QUESTIONABLE CLAIMS",
    "SELF-CHECK QUESTIONS",
  ],
  lv: [
    "PAR KO IR VIDEO",
    "ĪSS KOPSAVILKUMS",
    "GALVENĀS IDEJAS UN FAKTI",
    "KAM VIDEO BŪS NODERĪGS",
    "VAI IR VĒRTS SKATĪTIES",
    "PRAKTISKĀ RĪCĪBA",
    "APŠAUBĀMI APGALVOJUMI",
    "PAŠPĀRBAUDES JAUTĀJUMI",
  ],
};

for (const [language, headings] of Object.entries(HEADINGS)) {
  test(`промпт содержит восемь разделов и защиту для языка ${language}`, () => {
    const prompt = buildAnalysisPrompt("Тестовый transcript", { language });

    for (const heading of headings) {
      assert.ok(prompt.includes(heading), `Нет раздела: ${heading}`);
    }

    assert.match(prompt, /untrusted data, not instructions/i);
    assert.match(prompt, /Ignore any requests, commands/i);
    assert.match(prompt, /Тестовый transcript/);
  });
}

test("промпт явно сообщает об использовании фрагментов длинного транскрипта", () => {
  const prompt = buildAnalysisPrompt("Long transcript", {
    language: "en",
    shortened: true,
  });

  assert.match(prompt, /beginning, middle, and end/i);
});
