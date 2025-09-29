import { generateFieldJson } from "./generate-field-json.js";

/**
 * Generates an object with key/value pairs
 * @param sourceFile
 * @returns A json object
 */
export const generateFdfTemplate = async (
  sourceFile: string,
): Promise<Record<string, string>> => {
  const formFields = await generateFieldJson(sourceFile);
  const json: Record<string, string> = {};
  for (const row of formFields) {
    json[row.title] = row.fieldValue as string;
  }
  return json;
};
