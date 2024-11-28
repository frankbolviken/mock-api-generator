import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getEndpoints(
  dir: string,
  basePath: string = ""
): { path: string; method: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let endpoints: { path: string; method: string }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Exclude utility endpoints
      if (
        ![
          "endpoints",
          "delete-endpoint",
          "mock-response",
          "save-mock",
        ].includes(entry.name)
      ) {
        endpoints = endpoints.concat(
          getEndpoints(fullPath, path.join(basePath, entry.name))
        );
      }
    } else if (entry.name === "route.ts") {
      const content = fs.readFileSync(fullPath, "utf-8");
      const methodMatches = content.match(/export async function (\w+)/g);
      if (methodMatches) {
        for (const methodMatch of methodMatches) {
          const method = methodMatch.split(" ").pop();
          const apiPath = basePath || "/";
          endpoints.push({ path: apiPath, method });
        }
      }
    }
  }

  return endpoints;
}

export async function GET() {
  const apiDir = path.join(process.cwd(), "app", "api");
  const endpoints = getEndpoints(apiDir);

  return NextResponse.json(endpoints);
}
