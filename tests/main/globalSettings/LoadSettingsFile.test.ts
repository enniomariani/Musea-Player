import {beforeEach, describe, expect, it, beforeAll, afterAll, jest, afterEach} from "@jest/globals";
import {writeFileSync, mkdirSync, rmdirSync, rmSync} from 'fs';
import {LoadSettingsFile} from "main/globalSettings/LoadSettingsFile.js";

let loadSettingsFileTest:LoadSettingsFile = new LoadSettingsFile();

let testDirName:string = "__testDir";
let deleteTestDirAfterTests:boolean = true;

/**
 * this test creates a settings.txt file on the harddrive and deletes it after the tests
 */

let settingsFileStringCorrectJSON :string = '{\n' +
    '"Mauszeiger": true,\n' +
    '"Vollbild": false,\n' +
    '"BildschirmSchonerInMSec": 10000\n' +
    '}';
let settingsFileStringWrongJSON:string = '{\n' +
    '"Mauszeiger": true\n' +
    '"Vollbild": false,\n' +
    '"BildschirmSchonerInMSec": 10000\n' +
    '}';
let filePath = testDirName + "/settings.txt";

beforeAll(() => {
    try {
        mkdirSync(testDirName);
    } catch (e) {
        //if the directory already exist, do not delete it at the end of the test (because I do not know, why it
        //was created - possibly outside of this test)
        deleteTestDirAfterTests = false;
    }
});

beforeEach(() => {
    loadSettingsFileTest = new LoadSettingsFile();
});

afterEach(() =>{
    jest.clearAllMocks();
});

afterAll(() => {
    if (deleteTestDirAfterTests)
        rmdirSync(testDirName, {recursive: true});
});

describe("method load(pathToFile) ", () => {
    it("should return the loaded file as a JSON-object", async () => {
        writeFileSync(filePath, settingsFileStringCorrectJSON);

        const loadedFileJSON:any = loadSettingsFileTest.loadJSONSync(filePath);
        expect(loadedFileJSON).toEqual(JSON.parse(settingsFileStringCorrectJSON));

        //clean up
        rmSync(filePath);
    });

    it("should return null if the file was not found", () =>{
        const loadedFileJSON:any = loadSettingsFileTest.loadJSONSync(filePath);
        expect(loadedFileJSON).toBe(null);
    });

    it("should print an error on the console if the file was not found", () =>{
        let logSpy:any = jest.spyOn(global.console, 'error');
        loadSettingsFileTest.loadJSONSync(filePath);
        expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it("should should return null if the loaded data is not a valid JSON-Object", () =>{
        writeFileSync(filePath, settingsFileStringWrongJSON);

        const loadedFileJSON:any = loadSettingsFileTest.loadJSONSync(filePath);
        expect(loadedFileJSON).toBe(null);

        //clean up
        rmSync(filePath);
    });

    it("should fire an error on the console if the loaded file is not a valid JSON", () =>{
        let logSpy:any = jest.spyOn(global.console, 'error');
        writeFileSync(filePath, settingsFileStringWrongJSON);

        loadSettingsFileTest.loadJSONSync(filePath);
        expect(logSpy).toHaveBeenCalledTimes(1);

        //clean up
        rmSync(filePath);
    });
});