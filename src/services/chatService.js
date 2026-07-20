const languageService = require("./languageService");
const modeService = require("./modeService");
const formatResponse = require("../utils/formatResponse");

async function processMessage({ message, language, targetLanguage, mode, history = [] }) {
  const detectedLanguage = languageService.detect(language, message, targetLanguage);
  const selectedMode = modeService.select(mode, message);

  const reply = message || "";

  return formatResponse(reply, {
    language: detectedLanguage,
    mode: selectedMode
  });
}

module.exports = {
  processMessage
};
