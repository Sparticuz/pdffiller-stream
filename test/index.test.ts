import { Readable } from "node:stream";
import { expect, test } from "vitest";

import fillForm from "../src/index.js";

// generateFieldJson is just used here to verify that form has flattened.
// If it's flattened, we'll assume it was filled out properly.
import generateFieldJson from "../src/generate-field-json.js";

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
  const destinationPdf = "test/test_complete_filled.pdf";
  // @ts-expect-error I'm overloading
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fillForm(sourcePDF, data).toFile(destinationPdf);
  const roFdf = await generateFieldJson(destinationPdf);
  expect(roFdf.length).toBe(0);
});

/**
 * This test is passing, but not actually saving the UTF-8 correctly.
 * See #11
 */
test("should handle expanded utf characters and diacritics", async () => {
  const destinationPdf = "test/test_complete_diacritics.pdf";
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
});

test("should create an unflattened PDF with unfilled fields remaining", async () => {
  const destinationPdf = "test/test_complete_not_flattened.pdf";
  const filledData = {
    first_name: "Jerry",
  };
  // @ts-expect-error I'm overloading
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fillForm(sourcePDF, filledData, false).toFile(destinationPdf);
  const rwFdf = await generateFieldJson(destinationPdf);
  expect(rwFdf.length).not.toBe(0);
});

test("should return the values of a filled, but not flattened, pdf", async () => {
  const destinationPdf = "test/test_complete_not_flattened.pdf";
  const fdf = await generateFieldJson(destinationPdf);
  let passed = false;
  for (const field of fdf) {
    if (field.title === "first_name") {
      passed = true;
    }
  }
  expect(passed).toBe(true);
});

test.todo("should thrown when toFile is called on an invalid path");
