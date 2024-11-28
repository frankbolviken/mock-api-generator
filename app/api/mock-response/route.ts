import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function convertPathToNextFormat(path: string): string[] {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith("{") && segment.endsWith("}")) {
        return `[${segment.slice(1, -1)}]`;
      }
      return segment;
    });
}

function extractResponse(content: string, method: string): any {
  // Look for the exported constant
  const startMarker = `export const ${method}_RESPONSE = `;
  const startIndex = content.indexOf(startMarker);

  if (startIndex === -1) {
    return null;
  }

  // Start after the export declaration
  let jsonStart = startIndex + startMarker.length;
  let bracketCount = 0;
  let inString = false;
  let escape = false;

  // Parse character by character to handle nested structures
  for (let i = jsonStart; i < content.length; i++) {
    const char = content[i];

    if (!escape && char === '"') {
      inString = !inString;
    }

    if (!inString) {
      if (char === "{" || char === "[") {
        bracketCount++;
      } else if (char === "}" || char === "]") {
        bracketCount--;
        if (bracketCount === 0) {
          // We've found the end of the JSON object/array
          const json = content.substring(jsonStart, i + 1);
          try {
            return JSON.parse(json);
          } catch (e) {
            console.error("Failed to parse JSON:", json);
            return null;
          }
        }
      }
    }

    escape = !escape && char === "\\";
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const method = searchParams.get("method");

  if (!endpoint || !method) {
    return NextResponse.json(
      { error: "Missing endpoint or method" },
      { status: 400 }
    );
  }

  const parts = convertPathToNextFormat(endpoint);
  const filePath = path.join(process.cwd(), "app", "api", ...parts, "route.ts");

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const response = extractResponse(content, method);

    if (response) {
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: "Mock response not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching mock response:", error);
    return NextResponse.json(
      { error: "Failed to fetch mock response" },
      { status: 500 }
    );
  }
}
