const express = require('express');
const StudyMaterial = require('../../models/StudyMaterial');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /api/admin/study-materials (list all)
router.get('/', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {};
  const materials = await StudyMaterial.find(query)
    .populate('courseId', 'title')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(materials);
}));

// GET /api/admin/study-materials/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id)
    .populate('courseId', 'title')
    .populate('uploadedBy', 'name');
  if (!material) return res.status(404).json({ message: 'Study material not found' });
  res.json(material);
}));

// POST /api/admin/study-materials (upload new)
router.post('/', asyncHandler(async (req, res) => {
  const { type, title, description, pdfUrl, courseId } = req.body;
  
  if (!type || !title || !pdfUrl) {
    return res.status(400).json({ message: 'type, title, and pdfUrl are required' });
  }
  
  if (!['notes', 'current_affairs', 'previous_year_questions', 'syllabus'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type' });
  }

  const material = new StudyMaterial({
    type,
    title,
    description,
    pdfUrl,
    courseId: courseId || null,
    uploadedBy: req.admin.id,
  });

  await material.save();
  await material.populate('courseId', 'title');
  await material.populate('uploadedBy', 'name');
  res.status(201).json(material);
}));

// PUT /api/admin/study-materials/:id (update)
router.put('/:id', asyncHandler(async (req, res) => {
  const { title, description, pdfUrl, courseId } = req.body;
  
  const material = await StudyMaterial.findByIdAndUpdate(
    req.params.id,
    { title, description, pdfUrl, courseId: courseId || null },
    { new: true }
  )
    .populate('courseId', 'title')
    .populate('uploadedBy', 'name');
  
  if (!material) return res.status(404).json({ message: 'Study material not found' });
  res.json(material);
}));

// DELETE /api/admin/study-materials/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findByIdAndDelete(req.params.id);
  if (!material) return res.status(404).json({ message: 'Study material not found' });
  res.json({ ok: true });
}));

// GET /api/study-materials/by-type/:type (public - for website)
router.get('/by-type/:type', asyncHandler(async (req, res) => {
  const type = req.params.type;
  if (!['notes', 'current_affairs', 'previous_year_questions', 'syllabus'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type' });
  }
  
  const materials = await StudyMaterial.find({ type })
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });
  res.json(materials);
}));

module.exports = router;
