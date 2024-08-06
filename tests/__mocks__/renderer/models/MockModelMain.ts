import {ModelMain} from "renderer/models/ModelMain.js";
import {MockCreateGlobalSettings} from "__mocks__/renderer/models/globaSettings/MockCreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MockMuseaServer} from "musea-server/mocks";
import {MuseaServer} from "musea-server/renderer";

export class MockModelMain extends ModelMain {
    loadSettings: jest.Mock;
    initFrameWork: jest.Mock;

    constructor() {

        super(new MockCreateGlobalSettings(), new GlobalSettings(), new MockMuseaServer() as any as MuseaServer);

        this.loadSettings = jest.fn();
        this.initFrameWork = jest.fn();
    }
}