const chatService = require("../services/chatService");

async function handleChat(req, res) {
  try {
    const { message, language, targetLanguage, mode } = req.body;
    const result = await chatService.processMessage({
      message,
      language,
      targetLanguage,
      mode
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error"
    });
  }
}

module.exports = { handleChat };