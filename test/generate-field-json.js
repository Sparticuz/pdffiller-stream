const test = require("ava");
const fillForm = require("..").default;
const generateFieldJson = require("../dist/generate-field-json").default;
const { test1 } = require("./_expected-data");

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

const destination2PDF = "test/test_complete2.pdf";
const destination3PDF = "test/test_complete3.pdf";
const destination4PDF = "test/test_complete4.pdf";

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

test("should use toFile to create a completely filled PDF that is read-only", async (t) => {
    await fillForm(sourcePDF, data).toFile(destination2PDF);
    const roFdf = await generateFieldJson(destination2PDF);
    t.is(roFdf.length, 0);
});

test("should create an unflattened PDF with unfilled fields remaining", async (t) => {
    const data2 = {
        first_name: "Jerry",
    };

    await fillForm(sourcePDF, data2, false).toFile(destination3PDF);
    const rwFdf = await generateFieldJson(destination3PDF);
    t.not(rwFdf.length, 0);
});

test("should handle expanded utf characters and diacritics", async (t) => {
    const diacriticsData = {
        ...data,
        first_name: "मुख्यपृष्ठम्",
        last_name: "العقائدية الأخرى",
    };

    await fillForm(sourcePDF, diacriticsData, false).toFile(destination4PDF);
    const fdf = await generateFieldJson(destination4PDF);
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

    const fdf = await generateFieldJson(sourcePDF);
    t.deepEqual(fdf, expected2);
});

test("should generate another form field JSON with no errors", async (t) => {
    const fdf = await generateFieldJson(source2PDF);
    t.deepEqual(fdf, test1.form_fields);
});

test.todo("should make sure nameRegex works correctly");
