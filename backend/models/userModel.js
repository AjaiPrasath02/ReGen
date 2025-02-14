// name, email, password, role (admin, manuf, sorting machine, seller, buyer)

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['municipality', 'manufacturer', 'technician', 'labassistant']
  },
  walletAddress: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  labNumber: {
    type: String,
    // labNumber is required only if role === 'labassistant'
    required: [
      function() {
        return this.role === 'labassistant';
      },
      'labNumber is required for labassistant role'
    ]
  }
});

// static login method
userSchema.statics.login = async function (email, password, role) {
  if (!email || !password || !role) {
    throw Error('All fields must be filled');
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error('Incorrect email');
  }

  if (user.role !== role) {
    throw Error('Invalid role for this user');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error('Incorrect password');
  }

  return user;
}

// static signup method
userSchema.statics.signup = async function(email, password, name, role, walletAddress, location, labNumber) {
  // Validate all required fields
  if (!email || !password || !name || !role || !walletAddress || !location) {
    throw Error('All fields must be filled');
  }

  // For the lab assistant, we check labNumber as well
  if (role === 'labassistant' && !labNumber) {
    throw Error('Lab number is required for labassistant role');
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid');
  }

  // Check if email already exists
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error('Email already in use');
  }

  // Validate role
  const validRoles = ['municipality', 'manufacturer', 'technician', 'labassistant'];
  if (!validRoles.includes(role)) {
    throw Error('Invalid role');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Build the user object
  const userData = {
    email,
    password: hash,
    name,
    role,
    walletAddress,
    location,
  };

  // Conditionally add labNumber only if role is labassistant
  if (role === 'labassistant') {
    userData.labNumber = labNumber;
  }

  // Create the user with all relevant fields
  const user = await this.create(userData);

  return user;
}

module.exports = mongoose.model('User', userSchema);
