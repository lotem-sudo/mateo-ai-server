require('dotenv').config(); // טוען את מפתח ה-API מקובץ ה-.env
const app = require('./app'); // מייבא את הקוד החדש שכתבנו

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});