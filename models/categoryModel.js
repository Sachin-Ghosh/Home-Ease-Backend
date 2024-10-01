const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, // Description for the subcategory
    image: { type: String }, // URL for the subcategory image
});

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, // Description for the category
    image: { type: String }, // URL for the category image
    subCategories: [SubCategorySchema], // Array of subcategories
    createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;