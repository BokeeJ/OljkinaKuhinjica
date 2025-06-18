// routes/recipes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// ✅ Dohvatanje svih recepata
router.get('/', async (req, res) => {
    try {
        const svi = await Recipe.find().sort({ createdAt: -1 });
        res.json(svi);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Dodavanje novog recepta (samo ako je token validan)
router.post('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Nema tokena' });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET); // baca grešku ako nije validan

        const { title, description, category, imageUrl, imagePublicId } = req.body;

        if (!title || !description || !category || !imageUrl) {
            return res.status(400).json({ error: 'Nedostaju podaci' });
        }

        const novi = new Recipe({
            title,
            description,
            category,
            imageUrl,
            imagePublicId,
        });

        await novi.save();
        res.status(201).json(novi);
    } catch (err) {
        console.error('❌ Greška u POST /api/recipes:', err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ Brisanje recepta po ID-u
router.delete('/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recept obrisan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
