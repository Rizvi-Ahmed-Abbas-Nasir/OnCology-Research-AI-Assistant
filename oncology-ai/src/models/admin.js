const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    AdminID: { type: String, required: true },
    Adminpassword: { type: String, required: true },
   

});

// Prevent OverwriteModelError
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

module.exports = Admin;
