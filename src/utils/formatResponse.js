function formatResponse(rawResponse, context) {
  const reply =
    typeof rawResponse === "string"
      ? rawResponse
      : rawResponse && typeof rawResponse.reply === "string"
        ? rawResponse.reply
        : "";

  return {
    language: context.language,
    mode: context.mode,
    reply,
    meta: {
      shortByDefault: true,
      maxFollowupQuestions: 1
    }
  };
}

module.exports = formatResponse;