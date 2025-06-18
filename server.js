import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { storage } from './cloudinary.js';

import recipeRoutes from './routes/recipes.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const upload = multer({ storage });
const PORT = process.env.PORT || 5050;

// ✅ CORS setup — dozvoljava sve za razvoj
app.use(cors({
    origin: (origin, callback) => callback(null, true), // dozvoljava sve
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Log svake rute u terminal
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.url}`);
    next();
});

// ✅ Rute
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// ✅ Cloudinary upload ruta
app.post('/api/upload', upload.single('slika'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nema fajla za upload' });
    res.json({
        url: req.file.path,
        public_id: req.file.filename
    });
});

// ✅ Provera da li server radi
app.get('/', (req, res) => {
    res.status(200).json({ message: '🚀 Backend radi!' });
});

// ✅ Povezivanje na MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Povezan na MongoDB');
        app.listen(PORT, () => console.log(`🚀 Server radi na http://localhost:${PORT}`));
    })
    .catch((err) => console.error('❌ Greška pri povezivanju sa bazom:', err));
