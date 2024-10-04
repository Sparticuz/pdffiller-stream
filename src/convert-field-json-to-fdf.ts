import type { FormField } from "./generate-field-json.js";
/**
 * Converts JSON's boolean type to FDF's Yes/Off type
 * @param formFields An array of Form Fields
 * @returns An object with converted Form Fields
 */
export const convertFieldJsonToFdf = (
  formFields: FormField[],
): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const row of formFields) {
    if (typeof row.fieldValue === "boolean") {
      fields[row.title] = row.fieldValue ? "Yes" : "Off";
    } else {
      fields[row.title] = row.fieldValue;
    }
  }
  return fields;
};
export default convertFieldJsonToFdf;
