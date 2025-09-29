/**
 * Escapes backslashes and parens, also deals with null or undefined values
 * @param value The value that needs to be escaped
 */
const escapeString = (value: string | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }
  return Buffer.from(
    value
      .replaceAll("\\", "\\\\")
      .replaceAll("(", String.raw`\(`)
      .replaceAll(")", String.raw`\)`),
  ).toString("utf8");
};

/**
 * Converts a JSON object to a FDF document
 * @param data The JSON object
 * @returns FDF document in a Buffer
 */
export const createFdf = (
  data: Record<string, string | null | undefined>,
): Buffer => {
  // only this sequence in FDF header requires char codes
  const header = Buffer.from(
    `%FDF-1.2\n${
      String.fromCodePoint(226) +
      String.fromCodePoint(227) +
      String.fromCodePoint(207) +
      String.fromCodePoint(211)
    }\n1 0 obj \n<<\n/FDF \n<<\n/Fields [\n`,
  );

  let body = Buffer.from([]);

  for (const name of Object.keys(data)) {
    body = Buffer.concat([
      body,
      Buffer.from(
        `<<\n/T (${escapeString(name)})\n/V (${escapeString(
          // eslint-disable-next-line security/detect-object-injection
          data[name],
        )})\n>>\n`,
      ),
    ]);
  }

  const footer = Buffer.from(
    `]\n>>\n>>\nendobj \ntrailer\n\n<<\n/Root 1 0 R\n>>\n%%EOF\n`,
  );

  return Buffer.concat([header, body, footer]);
};
