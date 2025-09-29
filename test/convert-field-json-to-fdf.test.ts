import { expect, test } from "vitest";

import type { FormField } from "../src/generate-field-json.js";

import { convFieldJson2FDF } from "../src/convert-field-json-to-fdf.js";

test("Should change the boolean to a 'Yes/Off'", () => {
  const expected = {
    baseball: "Yes",
    basketball: "Off",
    date: "Jan 1, 2013",
    first_name: "John",
    football: "Off",
    hockey: "Yes",
    last_name: "Doe",
    nascar: "Off",
  };

  const input = [
    {
      fieldType: "Text",
      fieldValue: "John",
      title: "first_name",
    },
    {
      fieldType: "Text",
      fieldValue: "Doe",
      title: "last_name",
    },
    {
      fieldType: "Text",
      fieldValue: "Jan 1, 2013",
      title: "date",
    },
    {
      fieldType: "Button",
      fieldValue: false,
      title: "football",
    },
    {
      fieldType: "Button",
      fieldValue: true,
      title: "baseball",
    },
    {
      fieldType: "Button",
      fieldValue: false,
      title: "basketball",
    },
    {
      fieldType: "Button",
      fieldValue: true,
      title: "hockey",
    },
    {
      fieldType: "Button",
      fieldValue: false,
      title: "nascar",
    },
  ] as FormField[];

  const results = convFieldJson2FDF(input);
  expect(results).toEqual(expected);
});
