const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventTitle: { type: String, required: true },
    associateName: { type: String, required: true },
    location: { type: String, required: true },
    eventType: { type: String, required: true },
    description: { type: String, required: true },
    aboutEvent: { type: String, required: true },
    eventDescription: { type: String, required: true },
    websiteLink: { type: String, default: '' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    screenshots: { type: [String], default: [] }, // Array of image URLs or file paths
    selectedCategories: { type: [String], default: [] },

});

// Prevent OverwriteModelError
const CompletedEvent = mongoose.models.CompletedEvent || mongoose.model('CompletedEvent', eventSchema);

module.exports = CompletedEvent;
