const mongoose = require('mongoose');

const testSeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  priceOriginal: {
    type: Number,
    required: true,
    min: 0
  },
  priceSale: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'SSC'
  },
  isFree: {
    type: Boolean,
    default: false
  },
  externalLink: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-calculate discount percentage
testSeriesSchema.virtual('discount').get(function() {
  if (this.priceOriginal > 0 && this.priceOriginal > this.priceSale) {
    return Math.round(((this.priceOriginal - this.priceSale) / this.priceOriginal) * 100);
  }
  return 0;
});

// Include virtuals in JSON
testSeriesSchema.set('toJSON', { virtuals: true });
testSeriesSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TestSeries', testSeriesSchema);
