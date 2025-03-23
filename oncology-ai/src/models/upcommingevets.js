const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventTitle: { type: String, required: true },
    associateName: { type: String, required: true },
    date: { type: Date, required: true },
    eventType: { type: String, required: true },
    description: { type: String, required: true },
    websiteLink: { type: String, default: '' },
    eventImage: { type: String, default: '' },
    selectedCategories: { type: [String], default: [] },
});

// Prevent OverwriteModelError
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = Event;
