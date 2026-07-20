import 'dotenv/config'; // טוען את המפתח מקובץ .env המקומי או מהגדרות הענן
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// יצירת הלקוח של Groq בעזרת המפתח ממשתני הסביבה
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const conversationHistory = {};
const vocabularyStore = {};

// ראוט התחלת שיחה: ה-AI פותח ראשון בהתאם לתרחיש
app.post('/api/start-session', async (req, res) => {
    try {
        const { sessionId, roleplayContext } = req.body;
        conversationHistory[sessionId] = [];
        vocabularyStore[sessionId] = [];

        const systemPrompt = {
            role: 'system',
            content: `You are Mateo, an expert and engaging English Language Tutor.
The user chose to practice the scenario: "${roleplayContext || 'General Practice'}".
Start the conversation immediately in character (or as a friendly tutor if general). 
Keep your opening greeting natural, brief (1-2 sentences), and ask an inviting open question to start.`
        };

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [systemPrompt, { role: 'user', content: 'Start the session now.' }],
            temperature: 0.7
        });

        const initialGreeting = completion.choices[0]?.message?.content || "Hello! I'm Mateo. Ready to practice English?";
        
        conversationHistory[sessionId].push({ role: 'assistant', content: initialGreeting });

        res.json({ reply: initialGreeting });

    } catch (error) {
        console.error('Start Session Error:', error);
        res.status(500).json({ reply: "Hello! Let's practice English. How are you doing today?" });
    }
});

// ראוט השרשור והשיחה הרציפה
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId, roleplayContext } = req.body;

        if (!conversationHistory[sessionId]) {
            conversationHistory[sessionId] = [];
            vocabularyStore[sessionId] = [];
        }

        conversationHistory[sessionId].push({ role: 'user', content: message });

        const systemPrompt = {
            role: 'system',
            content: `You are Mateo, an expert English Language Tutor.
Context/Scenario: "${roleplayContext || 'General Conversation'}".

STRICT RULES (JSON ONLY):
1. **correction**: Check the user's latest sentence for grammar or phrasing mistakes. Explain simply if needed. If correct, return null.
2. **improvedSentence**: A natural, native-sounding alternative to what they said. If already perfect, return null.
3. **reply**: Your response in English (2-3 sentences max). ALWAYS ask an engaging follow-up question to keep the conversation going.

RESPONSE FORMAT (Strict JSON):
{
  "reply": "string",
  "correction": "string or null",
  "improvedSentence": "string or null"
}`
        };

        const messages = [systemPrompt, ...conversationHistory[sessionId].slice(-10)];

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0]?.message?.content || '{}';
        const aiResponse = JSON.parse(rawContent);

        if (aiResponse.reply) {
            conversationHistory[sessionId].push({ role: 'assistant', content: aiResponse.reply });
        }

        res.json({
            reply: aiResponse.reply || "I'm listening! Could you tell me more?",
            correction: aiResponse.correction || null,
            improvedSentence: aiResponse.improvedSentence || null
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ 
            reply: "Sorry, I had a momentary connection glitch. Could you try saying that again?",
            correction: null,
            improvedSentence: null
        });
    }
});

// שליפת מילים מתוך הזיכרון
app.get('/api/vocabulary/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    res.json({ vocabulary: vocabularyStore[sessionId] || [] });
});

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});