const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const studentSchema = new mongoose.Schema({
  name: String,
  id: String
});

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);

module.exports = { User, Student };
