export const IMG_FILE_HEADERS = {
    "jpg": "\xFF\xD8\xFF",
    "jpeg": "\xFF\xD8\xFF",
    "png": "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A",
    "gif": "\x47\x49\x46\x38\x37\x61",
};

export const PDF_FILE_HEADER = "\x25\x50\x44\x46";

export const decodeBase64 = (input: string | undefined): string | undefined => {
    if (input === undefined) {
        return input;
    }
    return atob(input).replace(/[\xC0-\xFF][\x80-\xBF]+/g, (match) => {
        let result;
        const first = match.charCodeAt(0);
        switch (first >>> 3) {
            case 0b11110:
                result = first & 7;
                break;
            case 0b11100:
            case 0b11101:
                result = first & 15;
                break;
            default:
                result = first & 31;
                break;
        }
        for (let i = 1; i < match.length; i++) {
            result <<= 6;
            result |= match.charCodeAt(i) & 63;
        }
        return String.fromCodePoint(result);
    });
};


export const encodeBase64 = (input: string): string => {
    const utf8 = input.replace(/[\x80-\uD7ff\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g, (match) => {
        const code = match.length === 2 ?
            // Surrogate pairs, yuck!
            0x10000 + (match.charCodeAt(0) - 0xD800) * 0x400 + (match.charCodeAt(1) - 0xDC00)
            :   match.charCodeAt(0);

        if (code < 0x80) {
            return String.fromCharCode(code);
        }
        if (code < 0x800) {
            return String.fromCharCode(0b110_00000 | (code >>> 6), 0b10_000000 | (code & 63));
        }
        if (code < 0x10000) {
            return String.fromCharCode(0b1110_0000 | (code >>> 12), 0b10_000000 | ((code >>> 6) & 63), 0b10_000000 | (code & 63));
        }
        return String.fromCharCode(0b11110_000 | (code >>> 18), 0b10_000000 | ((code >>> 12) & 63), 0b10_000000 | ((code >>> 6) & 63), 0b10_000000 | (code & 63));
    });
    return btoa(utf8);
};
