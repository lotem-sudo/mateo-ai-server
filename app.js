import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

// הגדרת __dirname עבור ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// חיבור ל-Groq API (וודא שיש לך מפתח תקין)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });// בסיסי נתונים בזיכרון השרת
const conversationHistory = {};
const vocabularyStore = {};

app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId, roleplayContext } = req.body;

        if (!conversationHistory[sessionId]) {
            conversationHistory[sessionId] = [];
            vocabularyStore[sessionId] = [];
        }

        // הוספת הודעת המשתמש להיסטוריה
        conversationHistory[sessionId].push({ role: 'user', content: message });

        // הנחיות קשיחות ל-AI כמורה שפה אקטיבי
        const systemPrompt = {
            role: 'system',
            content: `You are Mateo, an expert, patient, and engaging English Language Tutor.
Your objective is to help the user practice English in the following scenario: "${roleplayContext || 'General Conversation'}".

STRICT RULES FOR YOUR RESPONSE (JSON ONLY):
1. **correction**: Carefully check the user's latest message for any grammar, spelling, or phrasing mistakes (e.g., if they write "does it works", "i goes", "explain to me that in").
   - If there is an error, provide a clear, friendly correction rule in Hebrew or simple English.
   - If the sentence is grammatically correct, return null.
2. **improvedSentence**: Provide a more natural or native-sounding version of what the user attempted to say.
   - If the user's sentence was already natural and perfect, return null.
3. **reply**: Your direct, engaging response in English (2-3 sentences max).
   - ALWAYS keep the conversation going by asking an interesting follow-up question.
   - NEVER end the session when the user gives short responses (e.g., "okay", "yes"). Encourage them to expand!

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

        // שמירת תשובת ה-AI להיסטוריה
        if (aiResponse.reply) {
            conversationHistory[sessionId].push({ role: 'assistant', content: aiResponse.reply });
        }

        // חילוץ אוטומטי של מילים חדשות לכרטיסיות SRS
        const words = message.split(' ');
        if (words.length > 2) {
            const sampleWord = words.find(w => w.length > 4)?.replace(/[^a-zA-Z]/g, '');
            if (sampleWord && !vocabularyStore[sessionId].some(v => v.word.toLowerCase() === sampleWord.toLowerCase())) {
                vocabularyStore[sessionId].push({
                    word: sampleWord,
                    translation: 'מילה מהשיחה',
                    contextSentence: message,
                    strength: 1
                });
            }
        }

        res.json({
            reply: aiResponse.reply || "I'm listening! Could you elaborate a bit more?",
            correction: aiResponse.correction || null,
            improvedSentence: aiResponse.improvedSentence || null
        });

    } catch (error) {
        console.error('Chat AI Error:', error);
        res.status(500).json({ 
            reply: "Sorry, I had a momentary glitch. Could you try saying that again?",
            correction: null,
            improvedSentence: null
        });
    }
});

// שליפת מילים לכרטיסיות
app.get('/api/vocabulary/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    res.json({ vocabulary: vocabularyStore[sessionId] || [] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Speak-First AI Server running at http://localhost:${PORT}`);
});