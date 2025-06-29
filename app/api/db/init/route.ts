import { NextResponse } from "next/server";
import {
  checkDatabaseConnection,
  initializeDatabase,
} from "@/lib/initDatabase";

export async function GET() {
  try {
    // Check database connection
    const connectionSuccess = await checkDatabaseConnection();

    if (!connectionSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 }
      );
    }

    // Initialize database indexes
    const initSuccess = await initializeDatabase();

    if (!initSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Database initialization failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful and indexes created",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
