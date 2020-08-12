import generateFieldJson from "./generate-field-json";

/**
 * Generates an object with key/value pairs
 */
export default async (
    sourceFile: string,
    nameRegex: never
): Promise<Record<string, string>> => {
    const formFields = await generateFieldJson(sourceFile, nameRegex);
    const json: Record<string, string> = {};
    for (const row of formFields) {
        json[row.title] = row.fieldValue as string;
    }
    return json;
};
