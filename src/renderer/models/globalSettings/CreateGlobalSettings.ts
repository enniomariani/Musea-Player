import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";

export class CreateGlobalSettings {

    private _backend:IBackend;
    private _globalSettings: GlobalSettings;

    constructor(globalSettings:GlobalSettings, backend:IBackend) {
        this._globalSettings = globalSettings;
        this._backend = backend;
    }

    async create(){
        let backendData:IBackendData = await this._backend.loadSettings();

        this._globalSettings.pathToDataFolder = backendData.pathToDataFolder;
        this._globalSettings.errorsInJSON = backendData.errorsInJson;
        this._globalSettings.bgImageName = backendData.json.bgImageName;

        return this._globalSettings;
    }
}