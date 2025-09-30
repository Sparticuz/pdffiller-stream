import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { expect, test } from "vitest";

// generateFieldJson is just used here to verify that form has flattened.
// If it's flattened, we'll assume it was filled out properly.
import { generateFieldJson } from "../src/generate-field-json.js";
import fillForm from "../src/index.js";

/**
 * Calculate SHA256 hash of a file
 */
async function getFileHash(filePath: string): Promise<string> {
  // We are specifing the filePath directly so this is safe
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileBuffer = await readFile(filePath);
  return createHash("sha256").update(fileBuffer).digest("hex");
}

const sourcePDF = "test/test.pdf";

const data = {
  baseball: "Yes",
  basketball: "Off",
  date: "Jan 1, 2013",
  first_name: "1) John",
  football: "Off",
  hockey: "Yes",
  last_name: "Doe",
  nascar: "Off",
};

test("should return a readable stream when creating a pdf from test.pdf with filled data", async () => {
  const pdf = await fillForm(sourcePDF, data);
  expect(pdf).toBeInstanceOf(Readable);
});

test("should throw when the sourcePDF doesn't exist", async () => {
  await expect(() => fillForm("nope.pdf", data)).rejects.toThrow(
    "File does not exist or is not readable",
  );
});

test("should use toFile to create a completely filled PDF that is read-only", async () => {
  const destinationPdf = "test/out/test_complete_filled.pdf";
  // @ts-expect-error I'm overloading
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fillForm(sourcePDF, data).toFile(destinationPdf);
  const roFdf = await generateFieldJson(destinationPdf);
  expect(roFdf.length).toBe(0);

  // Verify the PDF was filled correctly by checking its hash
  const hash = await getFileHash(destinationPdf);
  expect(hash).toBe(
    "3d8927013f485ecec7b24396adca050a59b53fcd0cf23ed2c0e8910d845c8b09",
  );
});

/**
 * This test is passing, but not actually saving the UTF-8 correctly.
 * See #11
 */
test("should handle expanded utf characters and diacritics", async () => {
  const destinationPdf = "test/out/test_complete_diacritics.pdf";
  const diacriticsData = {
    ...data,
    first_name: "मुख्यपृष्ठम्",
    last_name: "العقائدية الأخرى",
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fillForm(sourcePDF, diacriticsData, [
    "drop_xfa",
    "need_appearances",
    // @ts-expect-error I'm overloading
  ]).toFile(destinationPdf);
  const fdf = await generateFieldJson(destinationPdf);
  expect(fdf.length).not.toBe(0);

  // Verify the PDF was filled correctly by checking its hash
  const hash = await getFileHash(destinationPdf);
  expect(hash).toBe(
    "c281bf0233c1d5f1cbb081559b5e3b3149426b2ae73b8e7816f6c86653608af7",
  );
});

test("should create an unflattened PDF with unfilled fields remaining", async () => {
  const destinationPdf = "test/out/test_complete_not_flattened.pdf";
  const filledData = {
    first_name: "Jerry",
  };
  // @ts-expect-error I'm overloading
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fillForm(sourcePDF, filledData, false).toFile(destinationPdf);
  const rwFdf = await generateFieldJson(destinationPdf);
  expect(rwFdf.length).not.toBe(0);

  // Verify the PDF was filled correctly by checking its hash
  const hash = await getFileHash(destinationPdf);
  expect(hash).toBe(
    "3ee4ea36c4955f7c87323315b0e220c3baa0932de11430a0ca66c28aa7a7b3e1",
  );
});

test("should return the values of a filled, but not flattened, pdf", async () => {
  const sourcePdf = "test/out/test_complete_not_flattened.pdf";
  const fdf = await generateFieldJson(sourcePdf);
  let passed = false;
  for (const field of fdf) {
    if (field.title === "first_name") {
      passed = true;
    }
  }
  expect(passed).toBe(true);
});

test.todo("should thrown when toFile is called on an invalid path");
