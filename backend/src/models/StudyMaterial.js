const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['notes', 'current_affairs', 'previous_year_questions', 'syllabus'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    pdfUrl: { type: String, required: true }, // Base64 or file path
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
