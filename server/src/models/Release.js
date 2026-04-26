const mongoose = require('mongoose');

const ReleaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  additionalInfo: {
    type: String,
    default: null
  },
  stepState: {
    type: Map,
    of: Boolean,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Release', ReleaseSchema);
