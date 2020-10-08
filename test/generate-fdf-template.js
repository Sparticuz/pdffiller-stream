const test = require("ava");
const { test1 } = require("./_expected-data");
const { generateFDFTemplate } = require("..");

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

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
    const fdf = await generateFDFTemplate(sourcePDF);
    t.deepEqual(fdf, expected3);
});

test("should generate another FDF Template with no errors", async (t) => {
    const fdf = await generateFDFTemplate(source2PDF);
    t.deepEqual(fdf, test1.fdfTemplate);
});
