const test = require("ava");
const createFdf = require("../dist/fdf").default;

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

test("should create a FDF template with a null value", (t) => {
    const fdfData = createFdf({
        ...data,
        nulval: undefined,
    });
    t.assert(fdfData);
});
