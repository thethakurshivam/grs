const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const pocbprndschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    mous: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MOU',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
pocbprndschema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
pocbprndschema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
pocbprndschema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const pocbprnd = mongoose.model('pocbprnd', pocbprndschema);

module.exports = pocbprnd;
