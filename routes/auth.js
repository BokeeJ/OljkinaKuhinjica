import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

console.log('✅ AUTH rute su učitane!');

// ✅ RUTA za pravljenje admina
router.get('/init-admin', async (req, res) => {
    try {
        const existing = await User.findOne({ username: 'admin' });
        if (existing) return res.status(400).json({ message: 'Admin već postoji' });

        const hashed = await bcrypt.hash('tajna123', 10);
        const admin = new User({ username: 'admin', password: hashed });
        await admin.save();
        res.status(201).json({ message: 'Admin napravljen: admin / tajna123' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Ne postoji korisnik' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Pogrešna lozinka' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
