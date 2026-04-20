import 'dotenv/config'; // MUST be first — loads .env before any other module initializes
import app from './app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
