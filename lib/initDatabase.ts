import { getDatabase } from "./mongodb";
import { FRAME_CONFIGS_COLLECTION } from "./models/frameConfig";

export async function initializeDatabase() {
  try {
    const db = await getDatabase();
    const collection = db.collection(FRAME_CONFIGS_COLLECTION);

    // Create unique index on the 'id' field for fast lookups
    await collection.createIndex({ id: 1 }, { unique: true });

    // Create index on createdAt for potential sorting/filtering
    await collection.createIndex({ createdAt: -1 });

    console.log("✅ Database indexes created successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    return false;
  }
}

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    const db = await getDatabase();
    await db.admin().ping();
    console.log("✅ MongoDB connection successful");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    return false;
  }
}
