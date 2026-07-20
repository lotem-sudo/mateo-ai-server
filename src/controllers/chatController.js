const chatService = require("../services/chatService");

async function handleChat(req, res) {
  try {
    const { message, language, targetLanguage, mode, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required and must be a string"
      });
    }

    const result = await chatService.processMessage({
      message,
      language,
      targetLanguage,
      mode,
      history
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}

module.exports = {
  handleChat
};
