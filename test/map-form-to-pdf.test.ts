import { expect, test } from "vitest";

import type { FormField } from "../src/generate-field-json.js";

import { mapForm2PDF } from "../src/map-form-to-pdf.js";

test("Should convert formJson to FDF data as expected", () => {
  const convMap = {
    baseballField: "baseball",
    bballField: "basketball",
    Date: "date",
    firstName: "first_name",
    footballField: "football",
    hockeyField: "hockey",
    lastName: "last_name",
    nascarField: "nascar",
  };

  const data = [
    {
      fieldType: "Text",
      fieldValue: "John",
      title: "lastName",
    },
    {
      fieldType: "Text",
      fieldValue: "Doe",
      title: "firstName",
    },
    {
      fieldType: "Text",
      fieldValue: "Jan 1, 2013",
      title: "Date",
    },
    {
      fieldType: "Button",
      fieldValue: false,
      title: "footballField",
    },
    {
      fieldType: "Button",
      fieldValue: true,
      title: "baseballField",
    },
    {
      fieldType: "Button",
      fieldValue: false,
      title: "bballField",
    },
    {
      fieldType: "Button",
      fieldValue: true,
      title: "hockeyField",
    },
    {
      fieldType: "Button",
      fieldValue: false,
      title: "nascarField",
    },
  ] as FormField[];

  const expected = {
    baseball: "Yes",
    basketball: "Off",
    date: "Jan 1, 2013",
    first_name: "Doe",
    football: "Off",
    hockey: "Yes",
    last_name: "John",
    nascar: "Off",
  };
  const convertedFDF = mapForm2PDF(data, convMap);
  expect(convertedFDF).toEqual(expected);
});
