// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  vid: { type: String, default: "" },
  class: { type: String, default: '' },
  batch: { type: String, default: '' },
  div: { type: String, default: '' },
  sem: { type: String, default: '' },
  hackathons: { type: [String], default: [] }, // Array of hackathon names
  competitions: { type: [String], default: [] }, // Array of competition names
  image: { type: String, default: '' }, // URL or path to the student's image
  year: { type: String, default: '' },
});

// Check if the model is already defined to prevent OverwriteModelError
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

module.exports = Student;
