const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    thumbnailUrl: { type: String },
    description: { type: String },
    priceOriginal: { type: Number, required: true },
    priceSale: { type: Number, required: true },
    categories: [{ type: String }],
    instructor: { type: String },
    externalLink: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', CourseSchema);
