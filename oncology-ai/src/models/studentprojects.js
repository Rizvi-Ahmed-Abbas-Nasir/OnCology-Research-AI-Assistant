const mongoose = require('mongoose');

// Define the Event Schema
const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: false },
  eventName: {
    type: String,
    required: true,
  },
  eventDescription: {
    type: String,
    required: true,  // Set to true if event description is mandatory
  },
  collegename: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  eventNotice: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: ['Internship', 'Sponsored Project ', 'Personal Project', 'Other'],  // Add categories as needed
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  department: {
    type: [String],  // Array of strings
    enum: ['Comps', 'IT', 'AIDS'],  // Add other departments as necessary
    required: true,
  },
  eligible_degree_year: {
    type: [String],  // Array of eligible years
    required: true,
  },
  ismoney: {
    type: Boolean,
    default: false,
  },
  money: {
    type: String,
    required: function () {
      return this.ismoney;
    },
  },
  image: {
    type: String, default: ""  // You can store the file path or the URL for the banner
  },
  certificate: {
    type: String,  default:"" // Certificate image path or URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists and create it if it doesn't
const StudentProjects = mongoose.models.StudentProjects || mongoose.model('StudentProjects', eventSchema);

module.exports = StudentProjects;
