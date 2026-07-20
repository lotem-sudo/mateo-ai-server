function detect(language, message, targetLanguage) {
  if (targetLanguage && ["he", "en", "es"].includes(targetLanguage)) {
    return targetLanguage;
  }

  if (language && ["he", "en", "es"].includes(language)) {
    return language;
  }

  const text = (message || "").toLowerCase();

  if (/[א-ת]/.test(text)) return "he";
  if (/[ñáéíóúü¿¡]/i.test(text)) return "es";
  if (/[a-z]/i.test(text)) return "en";

  return "he";
}

module.exports = {
  detect
};