import {beforeEach, describe, expect, it} from "@jest/globals";
import {ValidateSettingsJson} from "main/globalSettings/ValidateSettingsJson.js";


let classToTest: ValidateSettingsJson = new ValidateSettingsJson();
let varsAndTypes =
    {"Mauszeiger": "boolean", "Vollbild": "boolean", "BildschirmSchonerInMSec": "number"};

beforeEach(() => {
    classToTest = new ValidateSettingsJson();
});

describe("method validate(json, varsAndTypes) ", () => {
    it("should return true if the json contains the passed vars Mauszeiger as boolean, Vollbild as boolean and BildschirmSchonerInMSec as number", () => {
        let correctJSON: string = '{\n' +
            '"Mauszeiger": true,\n' +
            '"Vollbild": false,\n' +
            '"BildschirmSchonerInMSec": 10000\n' +
            '}';

        const result:any = classToTest.validate(JSON.parse(correctJSON), varsAndTypes);
        expect(result?.valid).toBe(true);
        expect(result?.errors).toEqual([]);
    });

    it("should return false and an error if the JSON does not contain all settings", () => {
        let correctJSON: string = '{\n' +
            '"Mauszeiger": true,\n' +
            '"Vollbild": false\n' +
            '}';

        const result:any = classToTest.validate(JSON.parse(correctJSON), varsAndTypes);
        expect(result?.valid).toBe(false);
        expect(result?.errors.length).toBe(1);
    });

    it("should return false and two errors if two data-types are wrong", () => {
        let wrongJSON: string = '{\n' +
            '"Mauszeiger": "test",\n' +
            '"Vollbild": false,\n' +
            '"BildschirmSchonerInMSec": true\n' +
            '}';
        const result:any = classToTest.validate(JSON.parse(wrongJSON), varsAndTypes);
        expect(result?.valid).toBe(false);
        expect(result?.errors.length).toBe(2);
    });

    it("should return null if the passed JSON is null", () => {
        const result:any = classToTest.validate(null, varsAndTypes);
        expect(result).toBe(null);
    });
});

