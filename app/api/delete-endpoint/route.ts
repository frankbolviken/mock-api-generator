import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const { path: endpointPath, method } = await request.json();

  if (!endpointPath || !method) {
    return NextResponse.json(
      { error: "Missing endpoint path or method" },
      { status: 400 }
    );
  }

  const parts = endpointPath.split("/").filter((part) => part !== "");
  const dirPath = path.join(process.cwd(), "app", "api", ...parts);
  const filePath = path.join(dirPath, "route.ts");

  try {
    fs.unlinkSync(filePath);
    // Remove empty directories
    let currentDir = dirPath;
    while (currentDir !== path.join(process.cwd(), "app", "api")) {
      if (fs.readdirSync(currentDir).length === 0) {
        fs.rmdirSync(currentDir);
        currentDir = path.dirname(currentDir);
      } else {
        break;
      }
    }
    return NextResponse.json({ message: "Endpoint deleted successfully" });
  } catch (error) {
    console.error("Error deleting endpoint:", error);
    return NextResponse.json(
      { error: "Failed to delete endpoint" },
      { status: 500 }
    );
  }
}
