require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const ExamDetail = require("../models/ExamDetail");

async function removeDeprecatedFields() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await ExamDetail.updateMany(
      {},
      {
        $unset: {
          description: 1,
          posterImage: 1,
          "seoData.lsiKeywords": 1,
          "seoData.metaTitle": 1,
          "seoData.imageAltTexts": 1,
          "seoData.seoScore": 1,
          "seoData.readabilityScore": 1,
        },
      }
    );

    console.log(`Documents matched: ${result.matchedCount}`);
    console.log(`Documents modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Failed to remove deprecated exam fields:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

removeDeprecatedFields();
