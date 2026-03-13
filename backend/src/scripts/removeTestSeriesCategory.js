require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const TestSeries = require("../models/TestSeries");

async function removeCategoryField() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await TestSeries.updateMany({}, { $unset: { category: 1 } });
    console.log(`Documents matched: ${result.matchedCount}`);
    console.log(`Documents modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Failed to remove test series category field:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

removeCategoryField();
