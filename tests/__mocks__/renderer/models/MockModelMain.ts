import {ModelMain} from "renderer/models/ModelMain.js";
import {MockCreateGlobalSettings} from "__mocks__/renderer/models/globaSettings/MockCreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MockMuseaServer} from "musea-server/mocks";
import {MuseaServer} from "musea-server/renderer";
import {jest} from "@jest/globals";

export class MockModelMain extends ModelMain {
    loadSettings: jest.Mock<ModelMain['loadSettings']>;
    initFrameWork: jest.Mock<ModelMain['initFrameWork']>;
    getSubsForFile: jest.Mock<ModelMain['getSubsForFile']>;

    constructor() {
        super(new MockCreateGlobalSettings(), new GlobalSettings(), jest.fn(), new MockMuseaServer() as any as MuseaServer);

        this.loadSettings = jest.fn<ModelMain['loadSettings']>();
        this.initFrameWork = jest.fn<ModelMain['initFrameWork']>();
        this.getSubsForFile = jest.fn<ModelMain['getSubsForFile']>();
    }
}