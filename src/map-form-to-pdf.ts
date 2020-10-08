import type { FormField } from "./generate-field-json";
import convertFieldJsonToFDF from "./convert-field-json-to-fdf";

// https://github.com/lodash/lodash/blob/master/mapKey.js
const mapKeys = (
    object: Record<string, string>,
    iteratee: (
        value: unknown,
        key: string | number,
        iObject: Record<string, string>
    ) => string
) => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(object)) {
        result[iteratee(value, key, object)] = value;
    }
    return result;
};

/**
 * This function converts the field names of a JSON object
 * to the field names of a PDF Form.
 * @param {*} formFields - The fields in the PDF
 * @param {*} convMap - The conversion matrix
 */
export default (
    formFields: FormField[],
    convMap: Record<string, string>
): Record<string, string> => {
    // First, get the field json.
    let temporaryFDFData = convertFieldJsonToFDF(formFields);

    temporaryFDFData = mapKeys(
        temporaryFDFData,
        (_value: unknown, key: string | number) => {
            if (Object.prototype.hasOwnProperty.call(convMap, key)) {
                return convMap[key];
            }
            return key as string;
        }
    );
    return temporaryFDFData;
};
