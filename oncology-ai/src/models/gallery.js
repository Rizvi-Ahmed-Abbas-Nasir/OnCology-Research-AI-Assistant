const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventTitle: { type: String, required: true },
    associateName: { type: String, required: true },
    eventType: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    screenshots: { type: [String], default: [] }, // Array of image URLs or file paths
    selectedCategories: { type: [String], default: [] },

});

// Prevent OverwriteModelError
const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', eventSchema);

module.exports = Gallery;
