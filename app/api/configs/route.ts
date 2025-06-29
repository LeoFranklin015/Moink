import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { FrameConfig } from "@/app/builder/page";

// Simple file-based storage (can be upgraded to a real database later)
const CONFIGS_FILE = path.join(process.cwd(), "data", "configs.json");

interface StoredConfig {
  id: string;
  config: FrameConfig;
  createdAt: string;
  updatedAt: string;
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(CONFIGS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load configs from file
async function loadConfigs(): Promise<Record<string, StoredConfig>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CONFIGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Save configs to file
async function saveConfigs(configs: Record<string, StoredConfig>) {
  await ensureDataDir();
  await fs.writeFile(CONFIGS_FILE, JSON.stringify(configs, null, 2));
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

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

    const configs = await loadConfigs();
    const id = generateId();
    const now = new Date().toISOString();

    const storedConfig: StoredConfig = {
      id,
      config,
      createdAt: now,
      updatedAt: now,
    };

    configs[id] = storedConfig;
    await saveConfigs(configs);

    return NextResponse.json({
      success: true,
      id,
      message: "Config saved successfully",
    });
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save config" },
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

    const configs = await loadConfigs();
    const storedConfig = configs[id];

    if (!storedConfig) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      config: storedConfig.config,
      metadata: {
        id: storedConfig.id,
        createdAt: storedConfig.createdAt,
        updatedAt: storedConfig.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving config:", error);
    return NextResponse.json(
      { error: "Failed to retrieve config" },
      { status: 500 }
    );
  }
}
