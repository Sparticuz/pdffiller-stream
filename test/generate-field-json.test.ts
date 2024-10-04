import { expect, test } from "vitest";

import generateFieldJson from "../src/generate-field-json.js";
import { formFields } from "./_expected-data.js";

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

test("should generate form field JSON as expected", async () => {
  const expected = [
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: [],
      fieldType: "Text",
      fieldValue: "",
      title: "first_name",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: [],
      fieldType: "Text",
      fieldValue: "",
      title: "last_name",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: [],
      fieldType: "Text",
      fieldValue: "",
      title: "date",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: ["Off", "Yes"],
      fieldType: "Button",
      fieldValue: "",
      title: "football",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: ["Off", "Yes"],
      fieldType: "Button",
      fieldValue: "",
      title: "baseball",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: [],
      fieldType: "Button",
      fieldValue: "",
      title: "basketball",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: ["Off", "Yes"],
      fieldType: "Button",
      fieldValue: "",
      title: "nascar",
    },
    {
      fieldDefault: "",
      fieldFlags: "0",
      fieldMaxLength: "",
      fieldOptions: ["Off", "Yes"],
      fieldType: "Button",
      fieldValue: "",
      title: "hockey",
    },
  ];

  const fdf = await generateFieldJson(sourcePDF);
  expect(fdf).toEqual(expected);
});

test("should generate a large form field JSON with no errors", async () => {
  const fdf = await generateFieldJson(source2PDF);
  expect(fdf).toEqual(formFields);
});
