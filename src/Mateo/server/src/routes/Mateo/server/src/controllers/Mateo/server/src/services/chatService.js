const languageService = require("./languageService");
const modeService = require("./modeService");
const llmService = require("./llmService");
const formatResponse = require("../utils/formatResponse");

async function processMessage({ message, language, targetLanguage, mode }) {
  const detectedLanguage = languageService.detect(language, message, targetLanguage);
  const selectedMode = modeService.select(mode, message);
  const prompt = await llmService.buildPrompt({
    message,
    language: detectedLanguage,
    targetLanguage,
    mode: selectedMode
  });

  const rawResponse = await llmService.callModel(prompt);

  return formatResponse(rawResponse, {
    language: detectedLanguage,
    mode: selectedMode
  });
}

module.exports = {
  processMessage
};