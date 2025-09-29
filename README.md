# PDF Filler Stream

[![npm version](https://badge.fury.io/js/%40sparticuz%2Fpdffiller.svg)](https://badge.fury.io/js/%40sparticuz%2Fpdffiller) ![Node.js CI](https://github.com/Sparticuz/pdffiller-stream/workflows/Node.js%20CI/badge.svg) ![CodeQL](https://github.com/Sparticuz/pdffiller-stream/workflows/CodeQL/badge.svg)

> This is a fork of the [pdf-filler](https://github.com/pdffillerjs/pdffiller) package, modified to return promises and readable streams, by piping data in/out of a spawned pdftk process instead of temporarily writing files to disk.

> The goal is cleaner integration, in eg. a microservices context, where it is preferable not to write multiple temporary files to disk and where you may wish to stream the generated pdf directly to a service like AWS.

A node.js PDF form field data filler and FDF generator toolkit. This essentially is a wrapper around the PDF Toolkit library [PDF ToolKit](http://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/).

As of version 4.0.0, this library now targets [pdftk-java](https://gitlab.com/pdftk-java/pdftk), a modern fork of pdftk.

## Quick start

**You must first have `pdftk` (from pdftk-java, found [here](https://gitlab.com/pdftk-java/pdftk)) installed correctly on your platform.**

Then, install this library:

```bash
npm install @sparticuz/pdffiller --save
```

**Note for AWS Lambda users, you may use a pdftk layer, found [here](https://github.com/Sparticuz/pdftk-aws-lambda)**

## Examples

#### 1.Fill PDF with existing FDF Data

```javascript
import fillForm from "@sparticuz/pdffiller";

const sourcePDF = "test/test.pdf";

const data = {
  last_name: "John",
  first_name: "Doe",
  date: "Jan 1, 2013",
  football: "Off",
  baseball: "Yes",
  basketball: "Off",
  hockey: "Yes",
  nascar: "Off",
};

const output = await fillForm(sourcePDF, data);
// output will be instance of stream.Readable
```

This will take the test.pdf, fill the fields with the data values and stream a filled in, read-only PDF.

A chainable convenience method `toFile` is attached to the response, if you simply wish to write the stream to a file with no fuss:

```javascript
fillForm(sourcePDF, data)
  .toFile("outputFile.PDF")
  .then(() => {
    // your file has been written
  })
  .catch((err) => {
    console.log(err);
  });
```

You could also stream the resulting data directly to AWS, doing something like this with an instantiated `s3` client:

```javascript
fillForm(sourcePDF, data)
  .then((outputStream) => {
    const Body = outputStream;
    const Bucket = "some-bucket";
    const Key = "myFancyNewFilledPDF";
    const ContentType = "application/pdf";

    const uploader = new AWS.S3.ManagedUpload({
      params: { Bucket, Key, Body, ContentType },
      service: s3,
    });

    uploader.promise().then((data) => {
      /* do something with AWS response */
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

Calling `fillForm()` with `shouldFlatten = false` will leave any unmapped fields still editable, as per the `pdftk` command specification.

```javascript

const shouldFlatten = false;

fillForm(sourcePDF, data, shouldFlatten)
    .then((outputStream) {
        // etc, same as above
    })
```

#### 1a. UTF-8 Characters in PDF forms

In order to have accents in the form fields of a form, `pdftk` needs the `needs_appearances` flag appended. Unfortunantly, if that flag is added, `flatten` is unable to be used. (Bug here: https://gitlab.com/pdftk-java/pdftk/-/issues/128)

```javascript

const shouldFlatten = false;

fillForm(sourcePDF, data, ["needs_appearances"])
    .then((outputStream) {
        // etc, same as above
    })
```

#### 2. Generate FDF Template from PDF

```javascript
import { generateFDFTemplate } from "@sparticuz/pdffiller";

const sourcePDF = "test/test.pdf";

const FDF_data = generateFDFTemplate(sourcePDF)
  .then((fdfData) => {
    console.log(fdfData);
  })
  .catch((err) => {
    console.log(err);
  });
```

This will print out this

```json
{
  "last_name": "",
  "first_name": "",
  "date": "",
  "football": "",
  "baseball": "",
  "basketball": "",
  "hockey": "",
  "nascar": ""
}
```

#### 3. Map form fields to PDF fields

```javascript
import { mapForm2PDF } from "@sparticuz/pdffiller";

const conversionMap = {
  lastName: "last_name",
  firstName: "first_name",
  Date: "date",
  footballField: "football",
  baseballField: "baseball",
  bballField: "basketball",
  hockeyField: "hockey",
  nascarField: "nascar",
};

const FormFields = {
  lastName: "John",
  firstName: "Doe",
  Date: "Jan 1, 2013",
  footballField: "Off",
  baseballField: "Yes",
  bballField: "Off",
  hockeyField: "Yes",
  nascarField: "Off",
};

mapForm2PDF(data, convMap).then((mappedFields) => {
  console.log(mappedFields);
});
```

This will print out the object below.

```json
{
  "last_name": "John",
  "first_name": "Doe",
  "date": "Jan 1, 2013",
  "football": "Off",
  "baseball": "Yes",
  "basketball": "Off",
  "hockey": "Yes",
  "nascar": "Off"
}
```

#### 4. Convert fieldJson to FDF data

```javascript
import { convFieldJson2FDF } from '@sparticuz/pdffiller';

const fieldJson = [
    {
        "title" : "last_name",
        "fieldfieldType": "Text",
        "fieldValue": "Doe"
    },
    {
        "title" : "first_name",
        "fieldfieldType": "Text",
        "fieldValue": "John"
    },
    {
        "title" : "date",
        "fieldType": "Text",
        "fieldValue": "Jan 1, 2013"
    },
    {
        "title" : "football",
        "fieldType": "Button",
        "fieldValue": false
    },
    {
        "title" : "baseball",
        "fieldType": "Button",
        "fieldValue": true
    },
    {
        "title" : "basketball",
        "fieldType": "Button"
        "fieldValue": false
    },
    {
        "title" : "hockey",
        "fieldType": "Button"
        "fieldValue": true
    },
    {
        "title" : "nascar",
        "fieldType": "Button"
        "fieldValue": false
    }
];


const FDFData = convFieldJson2FDF(data);

console.log(FDFData)
```

This will print out:

```json
{
    "last_name" : "John",
    "first_name" : "Doe",
    "date" : "Jan 1, 2013",
    "football" : "Off",
    "baseball" : "Yes",
    "basketball" : "Off",
    "hockey" : "Yes",
    "nascar" : "Off"
};
```
