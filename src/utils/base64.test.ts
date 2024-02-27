import { decodeBase64, encodeBase64 } from "./base64";

const pairs = {
  ascii: ["SGVsbG8h", "Hello!"],
  utf8bmp: ["w6LigqzigJQ=", "â€—"],
  utf8astral: ["8J+btA==", "🛴"],
  utf8flag: ["8J+Ps++4j+KAjfCfjIg=", "🏳️‍🌈"],
};

describe("base64", () => {
  Object.keys(pairs).forEach((k) => {
    const key = k as keyof typeof pairs;
    test(`encoding ${key}`, () => {
      expect(encodeBase64(pairs[key][1])).toBe(pairs[key][0]);
    });
    test(`decoding ${key}`, () => {
      expect(decodeBase64(pairs[key][0])).toBe(pairs[key][1]);
    });
  });
});
/*
test('ASCII decodes fine', () => {
  expect(decodeBase64("SGVsbG8h")).toBe("Hello!");
  expect(encodeBase64("Hello!")).toBe("SGVsbG8h");

});

test('UTF-8 BMP decodes fine', () => {
  expect(decodeBase64("w6LigqzigJQ=")).toBe("â€—");
});

test('UTF-8 astral plane decodes fine', () => {
  expect(decodeBase64("8J+btA==")).toBe("🛴");
});

test('UTF-8 flag decodes fine', () => {
  expect(decodeBase64("8J+Ps++4j+KAjfCfjIg=")).toBe("🏳️‍🌈");
});

*/
