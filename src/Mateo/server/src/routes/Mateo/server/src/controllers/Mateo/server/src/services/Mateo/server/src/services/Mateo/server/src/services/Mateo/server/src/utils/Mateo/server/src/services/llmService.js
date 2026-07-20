const fs = require("fs");
const path = require("path");

function getPrompt(language) {
  const map = {
    he: path.join(__dirname, "../prompts/system_prompt_he.txt"),
    en: path.join(__dirname, "../prompts/system_prompt_en.txt"),
    es: path.join(__dirname, "../prompts/system_prompt_es.txt")
  };

  return fs.readFileSync(map[language] || map.he, "utf8");
}

async function buildPrompt({ message, language, targetLanguage, mode }) {
  const systemPrompt = getPrompt(language);
  return {
    systemPrompt,
    message,
    language,
    targetLanguage,
    mode
  };
}

async function callModel(prompt) {
  return {
    reply: `Mock response for mode: ${prompt.mode}`
  };
}

module.exports = {
  buildPrompt,
  callModel
};