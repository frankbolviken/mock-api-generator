import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertPathToNextFormat(path) {
  return path
    .split("/")
    .map((segment) => {
      if (segment.startsWith("{") && segment.endsWith("}")) {
        return `[${segment.slice(1, -1)}]`;
      }
      return segment;
    })
    .filter(Boolean);
}

function generateApiFile(endpoint, methods) {
  const parts = convertPathToNextFormat(endpoint);
  const fileName = "route.ts";
  const dirPath = path.join(process.cwd(), "app", "api", ...parts);
  const filePath = path.join(dirPath, fileName);

  // Generate response objects for each method
  const responseObjects = Object.entries(methods)
    .map(([method, operation]) => {
      const successResponse = operation.responses["200"];
      const example =
        successResponse?.content?.["application/json"]?.example || {};

      return `export const ${method.toUpperCase()}_RESPONSE = ${JSON.stringify(
        example,
        null,
        2
      )}`;
    })
    .join("\n\n");

  // Generate method handlers
  const methodHandlers = Object.entries(methods)
    .map(([method, operation]) => {
      const params =
        endpoint.match(/{([^}]+)}/g)?.map((param) => param.slice(1, -1)) || [];
      const paramsTyping = params.length
        ? `{ params }: { params: { ${params.join(": string, ")}: string } }`
        : "request: Request";

      return `
export async function ${method.toUpperCase()}(${paramsTyping}) {
  return NextResponse.json(${method.toUpperCase()}_RESPONSE)
}`;
    })
    .join("\n\n");

  const fileContent = `
import { NextResponse } from 'next/server'

${responseObjects}

${methodHandlers}
`;

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, fileContent);
  console.log(`Generated API file: ${filePath}`);
}

function generateApis(swaggerFilePath) {
  const swaggerContent = fs.readFileSync(swaggerFilePath, "utf8");
  const swaggerDoc = yaml.load(swaggerContent);

  for (const [path, methods] of Object.entries(swaggerDoc.paths)) {
    generateApiFile(path, methods);
  }
}

const swaggerFilePath = path.join(process.cwd(), "swagger.yaml");
generateApis(swaggerFilePath);

// Run the Next.js development server
//execSync("npm run dev", { stdio: "inherit" });
