function select(mode, message) {
  const allowed = [
    "conversation",
    "correct_me",
    "explain_error",
    "grammar_help",
    "vocabulary_help",
    "pronunciation_help",
    "mini_lesson",
    "translation"
  ];

  if (mode && allowed.includes(mode)) {
    return mode;
  }

  const text = (message || "").toLowerCase();

  if (text.includes("translate") || text.includes("תרגם") || text.includes("traduce")) {
    return "translation";
  }

  if (text.includes("pronounce") || text.includes("הגייה") || text.includes("pronunciación")) {
    return "pronunciation_help";
  }

  if (text.includes("grammar") || text.includes("דקדוק") || text.includes("gramática")) {
    return "grammar_help";
  }

  if (text.includes("vocabulary") || text.includes("אוצר מילים") || text.includes("vocabulario")) {
    return "vocabulary_help";
  }

  if (text.includes("correct") || text.includes("תקן אותי") || text.includes("corrígeme")) {
    return "correct_me";
  }

  if (text.includes("explain") || text.includes("הסבר") || text.includes("explica")) {
    return "explain_error";
  }

  if (text.includes("lesson") || text.includes("שיעור") || text.includes("lección")) {
    return "mini_lesson";
  }

  return "conversation";
}

module.exports = {
  select
};
