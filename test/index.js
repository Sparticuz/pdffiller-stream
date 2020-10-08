const test = require("ava");
const { Readable } = require("stream");
const fillForm = require("..").default;

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

test("should return a readable stream when creating a pdf from test.pdf with filled data", async (t) => {
    const pdf = await fillForm(sourcePDF, data);
    if (pdf instanceof Readable) {
        t.pass();
    } else {
        t.fail();
    }
});

test("should throw when the sourcePDF doesn't exist", async (t) => {
    const error = await t.throwsAsync(() => fillForm("nope.pdf", data));
    t.is(error.message, "File does not exist or is not readable");
});

test.todo("should thrown when toFile is called on an invalid path");
