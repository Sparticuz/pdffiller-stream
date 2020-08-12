import { spawn } from "child_process";
import { access, constants, createWriteStream } from "fs";
import type { Readable } from "stream";
import createFdf from "./fdf";

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

export default (
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
    // @ts-ignore
    promised.toFile = toFile.bind(undefined, promised);
    return promised;
};
