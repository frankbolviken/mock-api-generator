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

export async function POST(request: Request) {
  const { endpoint, method, mockResponse, availableMethods } =
    await request.json();

  if (!endpoint || !method || !mockResponse) {
    return NextResponse.json(
      { error: "Missing endpoint, method, or mockResponse" },
      { status: 400 }
    );
  }

  // Validate JSON
  try {
    JSON.parse(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in mockResponse" },
      { status: 400 }
    );
  }

  const parts = convertPathToNextFormat(endpoint);
  const fileName = "route.ts";
  const dirPath = path.join(process.cwd(), "app", "api", ...parts);
  const filePath = path.join(dirPath, fileName);

  try {
    // Read existing file if it exists
    let existingContent = "";
    let existingMethods: Record<string, string> = {};

    if (fs.existsSync(filePath)) {
      existingContent = fs.readFileSync(filePath, "utf-8");

      // Extract existing method implementations
      for (const availableMethod of availableMethods) {
        const methodRegex = new RegExp(
          `export\\s+async\\s+function\\s+${availableMethod}\\s*\$$[^)]*\$$\\s*{([\\s\\S]*?)}`,
          "i"
        );
        const match = existingContent.match(methodRegex);
        if (match && match[1]) {
          existingMethods[availableMethod] = match[1].trim();
        }
      }
    }

    // Check if the endpoint has parameters
    const hasParams = endpoint.includes("{") && endpoint.includes("}");
    const paramsTyping = hasParams
      ? "{ params }: { params: Record<string, string> }"
      : "request: Request";

    // Update the current method's implementation
    existingMethods[method] = `\n  return NextResponse.json(${mockResponse})\n`;

    // Generate new file content with all methods
    const methodImplementations = Object.entries(existingMethods)
      .map(
        ([methodName, implementation]) => `
export async function ${methodName}(${paramsTyping}) {${implementation}}`
      )
      .join("\n\n");

    const fileContent = `
import { NextResponse } from 'next/server'
${methodImplementations}
`;

    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, fileContent);
    return NextResponse.json({ message: "Mock API saved successfully" });
  } catch (error) {
    console.error("Error saving mock API:", error);
    return NextResponse.json(
      { error: "Failed to save mock API" },
      { status: 500 }
    );
  }
}
