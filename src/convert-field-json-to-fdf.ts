import type { FormField } from "./generate-field-json";
/**
 * Converts JSON's boolean type to FDF's Yes/Off type
 * @param formFields An array of Form Fields
 * @returns An object with converted Form Fields
 */
export default (formFields: FormField[]): Record<string, string> => {
    const fields: Record<string, string> = {};
    for (const row of formFields) {
        if (typeof row.fieldValue === "boolean") {
            if (row.fieldValue) {
                fields[row.title] = "Yes";
            } else {
                fields[row.title] = "Off";
            }
        } else {
            fields[row.title] = row.fieldValue;
        }
    }
    return fields;
};
