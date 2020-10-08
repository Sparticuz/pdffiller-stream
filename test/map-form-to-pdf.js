const test = require("ava");
const { mapForm2PDF } = require("..");

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
    const convertedFDF = mapForm2PDF(data3, convMap);
    t.deepEqual(convertedFDF, expected5);
});
