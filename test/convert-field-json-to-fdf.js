const test = require("ava");
const { convFieldJson2FDF } = require("..");

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

    const FDFData = convFieldJson2FDF(data2);
    t.deepEqual(FDFData, expected4);
});
