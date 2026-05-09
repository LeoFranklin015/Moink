import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import {
  FrameConfigDocument,
  FRAME_CONFIGS_COLLECTION,
  createFrameConfigDocument,
  generateFrameConfigId,
} from "@/lib/models/frameConfig";
import { FrameConfig } from "@/app/builder/page";

// POST - Save a new config
export async function POST(request: NextRequest) {
  try {
    const { config }: { config: FrameConfig } = await request.json();

    if (!config) {
      return NextResponse.json(
        { error: "Config is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const collection = db.collection<FrameConfigDocument>(
      FRAME_CONFIGS_COLLECTION
    );

    // Generate unique ID and create document
    const id = generateFrameConfigId();
    const document = createFrameConfigDocument(id, config);

    // Insert into MongoDB
    const result = await collection.insertOne(document);

    if (!result.acknowledged) {
      throw new Error("Failed to insert config into database");
    }

    return NextResponse.json({
      success: true,
      id,
      message: "Config saved successfully",
    });
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      {
        error: "Failed to save config",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve a config by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Config ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getDatabase();
    const collection = db.collection<FrameConfigDocument>(
      FRAME_CONFIGS_COLLECTION
    );

    // Find document by ID
    const document = await collection.findOne({ id });

    if (!document) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config: document.config,
      metadata: {
        id: document.id,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error retrieving config:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve config",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
