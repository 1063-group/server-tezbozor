const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isVerifiedSeller: {
      type: Boolean,
      required: false,
      default: false,
    },
    img: {
      type: String,
      required: false,
      default:
        'https://cdn1.iconfinder.com/data/icons/prettyoffice8/256/User-green.png',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'seller'],
      default: 'customer',
    },
    storeName: {
      type: String,
      required: function() {
        return this.role === 'seller';
      },
      trim: true,
    },
    storeDescription: {
      type: String,
      required: function() {
        return this.role === 'seller';
      },
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Пароль хешируется
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Сравнение пароля
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;