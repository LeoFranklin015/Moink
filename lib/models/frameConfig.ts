import { ObjectId } from "mongodb";
import { FrameConfig } from "@/app/builder/page";

// MongoDB document interface
export interface FrameConfigDocument {
  _id?: ObjectId;
  id: string;
  config: FrameConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Collection name
export const FRAME_CONFIGS_COLLECTION = "frame_configs";

// Utility functions for frame config operations
export function createFrameConfigDocument(
  id: string,
  config: FrameConfig
): Omit<FrameConfigDocument, "_id"> {
  const now = new Date();
  return {
    id,
    config,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateFrameConfigId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
