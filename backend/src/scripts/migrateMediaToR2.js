/*
 * One-time migration for media that is currently stored as Base64 in MongoDB.
 *
 * Preview only (does not write): npm run migrate:r2
 * Apply changes:                    npm run migrate:r2 -- --apply
 *
 * Requires the R2_* variables and MONGO_URI in backend/.env.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Banner = require('../models/Banner');
const TestSeries = require('../models/TestSeries');
const ExamDetail = require('../models/ExamDetail');
const { dataUrlToFile, isR2Configured, uploadBuffer } = require('../utils/r2');

const apply = process.argv.includes('--apply');
const dbName = process.env.MONGO_DB_NAME || 'rajjobs';
let migrated = 0;
let skipped = 0;

async function moveDataUrl(dataUrl, folder, fallbackName) {
  const file = dataUrlToFile(dataUrl, fallbackName);
  if (!file) return null;
  if (!apply) return `https://cdn.rajjobs.com/${folder}/preview`;
  const result = await uploadBuffer({ ...file, folder });
  return result.url;
}

async function migrateField(Model, field, folder) {
  const documents = await Model.find({ [field]: /^data:image\//i });
  for (const document of documents) {
    const url = await moveDataUrl(document[field], folder, `${Model.modelName}-${document._id}`);
    if (!url) {
      skipped += 1;
      continue;
    }
    if (apply) {
      document[field] = url;
      await document.save();
    }
    migrated += 1;
    console.log(`${apply ? 'Migrated' : 'Would migrate'} ${Model.modelName}.${field}: ${document._id}`);
  }
}

async function migrateExamHtml() {
  const documents = await ExamDetail.find({ formattedNote: /data:image\//i });
  const imagePattern = /(<img\b[^>]*?\bsrc=["'])(data:image\/[^"']+)(["'])/gi;

  for (const document of documents) {
    let replacementCount = 0;
    let nextHtml = document.formattedNote.replace(imagePattern, (match, prefix, dataUrl, suffix) => {
      // Replacements are completed below because R2 uploads are asynchronous.
      return match;
    });
    const images = [...document.formattedNote.matchAll(imagePattern)];

    for (const image of images) {
      const url = await moveDataUrl(image[2], 'exam-details', `exam-${document._id}`);
      if (!url) {
        skipped += 1;
        continue;
      }
      replacementCount += 1;
      if (apply) nextHtml = nextHtml.replace(image[2], url);
    }

    if (replacementCount && apply) {
      document.formattedNote = nextHtml;
      await document.save();
    }
    migrated += replacementCount;
    if (replacementCount) console.log(`${apply ? 'Migrated' : 'Would migrate'} ${replacementCount} image(s) in ExamDetail: ${document._id}`);
  }
}

async function main() {
  if (!isR2Configured) throw new Error('R2 is not fully configured. Add R2_* values to backend/.env first.');
  await mongoose.connect(process.env.MONGO_URI, { dbName });
  console.log(`${apply ? 'Applying' : 'Previewing'} R2 migration for database: ${dbName}`);

  await migrateField(Course, 'thumbnailUrl', 'course-thumbnails');
  await migrateField(Banner, 'imageUrl', 'banners');
  await migrateField(TestSeries, 'thumbnailUrl', 'test-series');
  await migrateExamHtml();

  console.log(`Done. ${apply ? 'Migrated' : 'Would migrate'}: ${migrated}; skipped: ${skipped}.`);
  if (!apply) console.log('Run `npm run migrate:r2 -- --apply` after reviewing this preview.');
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('R2 migration failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
