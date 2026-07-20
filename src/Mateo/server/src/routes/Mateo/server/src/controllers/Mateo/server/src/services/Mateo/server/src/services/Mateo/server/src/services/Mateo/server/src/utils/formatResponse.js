function formatResponse(rawResponse, context) {
  return {
    language: context.language,
    mode: context.mode,
    reply: typeof rawResponse === "string" ? rawResponse : rawResponse?.reply || "",
    meta: {
      shortByDefault: true,
      maxFollowupQuestions: 1
    }
  };
}

module.exports = formatResponse;