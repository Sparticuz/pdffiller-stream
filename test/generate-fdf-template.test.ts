import { expect, test } from "vitest";

import { generateFdfTemplate } from "../src/generate-fdf-template.js";
import { fdfTemplate } from "./_expected-data.js";

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

test("should generate a FDF Template as expected", async () => {
  const expected = {
    baseball: "",
    basketball: "",
    date: "",
    first_name: "",
    football: "",
    hockey: "",
    last_name: "",
    nascar: "",
  };
  const fdf = await generateFdfTemplate(sourcePDF);
  expect(fdf).toEqual(expected);
});

test("should generate a large FDF Template with no errors", async () => {
  const fdf = await generateFdfTemplate(source2PDF);
  expect(fdf).toEqual(fdfTemplate);
});
