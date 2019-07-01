const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: [
      {
        validator: (v) => {
          return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(v);
        },
        message: 'Некорректный email',
      },
    ],
    lowercase: true,
    trim: true,
    index: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
});

schema.pre('save', function() {
  next();
});

module.exports = mongoose.model('User', schema);
