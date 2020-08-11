/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 *   File:       pdf.js
 *   Project:    PDF Filler
 *   Date:       June 2015.
 *
 */

const test = require("ava");
const { Readable } = require("stream");
const pdfFiller = require("..").default;
const createFdf = require("../dist/fdf").default;
const { test1 } = require("./_expected-data");

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

const destination2PDF = "test/test_complete2.pdf";
const destination3PDF = "test/test_complete3.pdf";
const destination4PDF = "test/test_complete4.pdf";

/**
 * Unit tests
 */

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

test("should return a readable stream when creating a pdf from test.pdf with filled data", async (t) => {
    const pdf = await pdfFiller.fillForm(sourcePDF, data);
    if (pdf instanceof Readable) {
        t.pass();
    } else {
        t.fail();
    }
});

test("should use toFile to create a completely filled PDF that is read-only", async (t) => {
    await pdfFiller.fillForm(sourcePDF, data).toFile(destination2PDF);
    const roFdf = await pdfFiller.generateFieldJson(destination2PDF);
    t.is(roFdf.length, 0);
});

test("should throw when the sourcePDF doesn't exist", async (t) => {
    await t.throwsAsync(async () => pdfFiller.fillForm("nope.pdf", data));
    // t.is(error.message, "Error: File does not exist or is not readable");
});

test.skip("should throw when output is an invalid path", async (t) => {
    const error = await t.throwsAsync(async () => {
        await pdfFiller.fillFormWithFlatten(source2PDF, data, true).toFile("/");
    });
    t.is(error, "Error: EISDIR: illegal operation on a directory, open '/'");
});

test.skip("should create a FDF template with a null value", (t) => {
    const fdfData = createFdf({
        ...data,
        nulval: undefined,
    });
    t.assert(fdfData);
});

test.skip("should fail to FDF template with an invalid value", (t) => {
    const fdfData = createFdf({
        ...data,
        badval: {
            badvar: () => {
                return false;
            },
        },
    });
    console.log(fdfData.toString());
    t.not(fdfData, 0);
});

test("should create an unflattened PDF with unfilled fields remaining", async (t) => {
    const data2 = {
        first_name: "Jerry",
    };

    await pdfFiller.fillForm(sourcePDF, data2, false).toFile(destination3PDF);
    const rwFdf = await pdfFiller.generateFieldJson(destination3PDF);
    t.not(rwFdf.length, 0);
});

test("should handle expanded utf characters and diacritics", async (t) => {
    const diacriticsData = {
        ...data,
        first_name: "मुख्यपृष्ठम्",
        last_name: "العقائدية الأخرى",
    };

    await pdfFiller
        .fillForm(sourcePDF, diacriticsData, false)
        .toFile(destination4PDF);
    const fdf = await pdfFiller.generateFieldJson(destination4PDF);
    t.not(fdf.length, 0);
});

test("should generate form field JSON as expected", async (t) => {
    const expected2 = [
        {
            fieldFlags: "0",
            fieldType: "Text",
            fieldValue: "",
            title: "first_name",
        },
        {
            fieldFlags: "0",
            fieldType: "Text",
            fieldValue: "",
            title: "last_name",
        },
        {
            fieldFlags: "0",
            fieldType: "Text",
            fieldValue: "",
            title: "date",
        },
        {
            fieldFlags: "0",
            fieldType: "Button",
            fieldValue: "",
            title: "football",
        },
        {
            fieldFlags: "0",
            fieldType: "Button",
            fieldValue: "",
            title: "baseball",
        },
        {
            fieldFlags: "0",
            fieldType: "Button",
            fieldValue: "",
            title: "basketball",
        },
        {
            fieldFlags: "0",
            fieldType: "Button",
            fieldValue: "",
            title: "nascar",
        },
        {
            fieldFlags: "0",
            fieldType: "Button",
            fieldValue: "",
            title: "hockey",
        },
    ];

    const fdf = await pdfFiller.generateFieldJson(sourcePDF);
    t.deepEqual(fdf, expected2);
});

test("should generate another form field JSON with no errors", async (t) => {
    const fdf = await pdfFiller.generateFieldJson(source2PDF);
    t.deepEqual(fdf, test1.form_fields);
});

test("should generate a FDF Template as expected", async (t) => {
    const expected3 = {
        baseball: "",
        basketball: "",
        date: "",
        first_name: "",
        football: "",
        hockey: "",
        last_name: "",
        nascar: "",
    };
    const fdf = await pdfFiller.generateFDFTemplate(sourcePDF);
    t.deepEqual(fdf, expected3);
});

test("should generate another FDF Template with no errors", async (t) => {
    const fdf = await pdfFiller.generateFDFTemplate(source2PDF);
    t.deepEqual(fdf, test1.fdfTemplate);
});

test("Should generate an corresponding FDF object", (t) => {
    const expected4 = {
        baseball: "Yes",
        basketball: "Off",
        date: "Jan 1, 2013",
        first_name: "John",
        football: "Off",
        hockey: "Yes",
        last_name: "Doe",
        nascar: "Off",
    };

    const data2 = [
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
    ];

    const FDFData = pdfFiller.convFieldJson2FDF(data2);
    t.deepEqual(FDFData, expected4);
});

test("Should convert formJson to FDF data as expected", (t) => {
    const convMap = {
        Date: "date",
        baseballField: "baseball",
        bballField: "basketball",
        firstName: "first_name",
        footballField: "football",
        hockeyField: "hockey",
        lastName: "last_name",
        nascarField: "nascar",
    };

    const data3 = [
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
    ];

    const expected5 = {
        baseball: "Yes",
        basketball: "Off",
        date: "Jan 1, 2013",
        first_name: "Doe",
        football: "Off",
        hockey: "Yes",
        last_name: "John",
        nascar: "Off",
    };
    const convertedFDF = pdfFiller.mapForm2PDF(data3, convMap);
    t.deepEqual(convertedFDF, expected5);
});
