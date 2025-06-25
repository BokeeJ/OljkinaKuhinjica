import express from 'express';
import jwt from 'jsonwebtoken';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// ✅ 1. Svi recepti
router.get('/', async (req, res) => {
    try {
        const svi = await Recipe.find().sort({ createdAt: -1 });
        res.json(svi);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 7. Najpopularniji recepti (sortirani po lajkovima)
router.get('/popular', async (req, res) => {
    try {
        const popularni = await Recipe.find().sort({ likes: -1 });
        res.json(popularni);
    } catch (err) {
        res.status(500).json({ error: 'Greška pri preuzimanju popularnih' });
    }
});

// ✅ 8. Filter po kategoriji
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const recipes = await Recipe.find({ category });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: 'Greška pri preuzimanju po kategoriji' });
    }
});

// ✅ 2. Pojedinačan recept
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recept ne postoji' });
        }
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: 'Greška pri preuzimanju recepta' });
    }
});

// ✅ 3. Kreiranje recepta
router.post('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Nema tokena' });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);

        const { title, description, category, imageUrl, imagePublicId } = req.body;

        if (!title || !description || !category || !imageUrl) {
            return res.status(400).json({ error: 'Nedostaju podaci' });
        }

        const novi = new Recipe({ title, description, category, imageUrl, imagePublicId });
        await novi.save();
        res.status(201).json(novi);
    } catch (err) {
        console.error('❌ Greška u POST /api/recipes:', err);
        res.status(500).json({ error: err.message });
    }
});

// ✅ 4. Brisanje recepta
router.delete('/:id', async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.json({ message: 'Recept obrisan' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 5. Lajkovanje
router.post('/:id/like', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recept ne postoji' });
        }
        recipe.likes = (recipe.likes || 0) + 1;
        await recipe.save();
        res.json({ likes: recipe.likes });
    } catch (err) {
        res.status(500).json({ error: 'Greška pri lajkovanju' });
    }
});

// ✅ 6. Dislajkovanje
router.post('/:id/dislike', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recept ne postoji' });
        }
        recipe.likes = Math.max((recipe.likes || 0) - 1, 0);
        await recipe.save();
        res.json({ likes: recipe.likes });
    } catch (err) {
        res.status(500).json({ error: 'Greška pri dislajkovanju' });
    }
});

export default router;
