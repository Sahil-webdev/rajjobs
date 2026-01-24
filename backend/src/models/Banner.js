const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    order: { type: Number, enum: [1, 2, 3, 4], required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', BannerSchema);
