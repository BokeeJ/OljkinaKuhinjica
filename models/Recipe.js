import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['slano', 'slatko'], required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    likes: { type: Number, default: 0 },
}, {
    timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
