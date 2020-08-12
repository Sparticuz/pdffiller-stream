import { spawn } from "child_process";
import { access, constants, createWriteStream } from "fs";
import type { Readable } from "stream";
import createFdf from "./fdf";

interface FormField {
    fieldFlags: string;
    fieldType: string;
    fieldValue: string | boolean;
    title: string;
}

// https://github.com/lodash/lodash/blob/master/mapKey.js
const mapKeys = (
    object: Record<string, string>,
    iteratee: (
        value: unknown,
        key: string | number,
        object: Record<string, string>
    ) => string
) => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(object)) {
        result[iteratee(value, key, object)] = value;
    }
    return result;
};

/**
 * convenience chainable method for writing to a file (see examples)
 * */
const toFile = (
    promised: Promise<Readable>,
    path: string
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        promised
            // eslint-disable-next-line promise/always-return
            .then((outputStream) => {
                const output = createWriteStream(path);
                outputStream.pipe(output);
                outputStream.on("close", () => {
                    output.end();
                    resolve(true);
                });
            })
            .catch((error) => reject(error));
    });
};

export default {
    convFieldJson2FDF: (fieldJson: FormField[]): Record<string, string> => {
        const json: Record<string, string> = {};
        for (const row of fieldJson) {
            if (typeof row.fieldValue === "boolean") {
                if (row.fieldValue) {
                    json[row.title] = "Yes";
                } else {
                    json[row.title] = "Off";
                }
            } else {
                json[row.title] = row.fieldValue;
            }
        }
        return json;
    },
    fillForm: (
        sourceFile: string,
        fieldValues: never,
        extraArguments: string[] | false = ["flatten"]
    ): Promise<Readable> => {
        const promised: Promise<Readable> = new Promise((resolve, reject) => {
            // Check to see if sourceFile exists!
            access(sourceFile, constants.F_OK || constants.R_OK, (error) => {
                if (error)
                    reject(new Error("File does not exist or is not readable"));
            });

            // Generate the data from the field values.
            const FDFinput = createFdf(fieldValues);

            const runArguments = [sourceFile, "fill_form", "-", "output", "-"];

            if (typeof extraArguments === "object") {
                for (const argument of extraArguments) {
                    runArguments.push(argument);
                }
            }

            const childProcess = spawn("pdftk", runArguments);

            childProcess.on("error", (error) => reject(error));
            childProcess.stdout.on("error", (error) => reject(error));
            childProcess.stderr.on("error", (error) => reject(error));
            childProcess.stdin.on("error", (error) => reject(error));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sendData = (chunk: any) => {
                childProcess.stdout.pause();
                childProcess.stdout.unshift(chunk);
                resolve(childProcess.stdout);
                childProcess.stdout.removeListener("data", sendData);
            };

            childProcess.stdout.on("data", sendData);

            // now pipe FDF to pdftk
            childProcess.stdin.write(FDFinput);
            childProcess.stdin.end();
        });

        // bind convenience method toFile for chaining
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error ts2339
        promised.toFile = toFile.bind(undefined, promised);
        return promised;
    },

    generateFDFTemplate(
        sourceFile: string,
        nameRegex: never
    ): Promise<Record<string, string>> {
        return new Promise((resolve, reject) => {
            this.generateFieldJson(sourceFile, nameRegex)
                .then((formFields) => {
                    const json: Record<string, string> = {};
                    // eslint-disable-next-line promise/always-return
                    for (const row of formFields) {
                        json[row.title] = row.fieldValue as string;
                    }
                    resolve(json);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    generateFieldJson: (
        sourceFile: string,
        nameRegex: never
    ): Promise<FormField[]> => {
        let regName = /FieldName: ([^\n]*)/;
        const regType = /FieldType: ([\t .A-Za-z]+)/;
        const regFlags = /FieldFlags: ([\d\t .]+)/;
        const fieldArray: FormField[] = [];

        if (nameRegex !== null && typeof nameRegex === "object")
            regName = nameRegex;

        return new Promise((resolve, reject) => {
            const childProcess = spawn("pdftk", [
                sourceFile,
                "dump_data_fields_utf8",
            ]);
            let output = "";

            childProcess.on("error", (error) => reject(error));
            childProcess.stdout.on("error", (error) => reject(error));
            childProcess.stderr.on("error", (error) => reject(error));
            childProcess.stdin.on("error", (error) => reject(error));

            childProcess.stdout.on("data", (data) => {
                output += data;
            });

            childProcess.stdout.on("end", () => {
                const fields = output.split("---").slice(1);
                fields.forEach((field) => {
                    fieldArray.push({
                        fieldFlags:
                            (regFlags.exec(field)?.[1].trim() as string) ?? "",
                        fieldType:
                            (regType.exec(field)?.[1].trim() as string) ?? "",
                        fieldValue: "",
                        title:
                            (regName.exec(field)?.[1].trim() as string) ?? "",
                    });
                });
                resolve(fieldArray);
            });
        });
    },

    /**
     * This function converts the field names of a JSON object
     * to the field names of a PDF Form.
     * @param {*} formFields - The fields in the PDF
     * @param {*} convMap - The conversion matrix
     */
    mapForm2PDF(
        formFields: FormField[],
        convMap: Record<string, string>
    ): Record<string, string> {
        // First, get the field json.
        let temporaryFDFData = this.convFieldJson2FDF(formFields);

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
    },
};
