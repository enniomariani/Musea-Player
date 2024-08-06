import {ipcMain} from "electron";
import {join} from "path";
import {LoadSettingsFile} from "main/globalSettings/LoadSettingsFile.js";
import {ValidateSettingsJson} from "main/globalSettings/ValidateSettingsJson.js";
import {ValidationError, ValidatorResult} from "jsonschema";
import {GlobalSettings} from "main/globalSettings/GlobalSettings.js";
import {GlobalSettingsFactory} from "main/globalSettings/GlobalSettingsFactory.js";

export class InitSettings {
    private _fileNameSettings: string = "settings.txt";
    private _settingsValidationErrors: (string|ValidationError)[] = [];

    constructor() {}

    /**
     * loads the settings.txt file, sets the global settings and overrides the values of the global settings with the values found in the settings-file
     */
    init(pathToDataFolder:string):any{
        let loadSettingsFile: LoadSettingsFile = new LoadSettingsFile();
        let jsonValidation: ValidateSettingsJson = new ValidateSettingsJson();
        let settingsJSON: any = null;
        let filePath: string
        let validationResult: ValidatorResult | null;
        let globalSettings: GlobalSettings = new GlobalSettings();
        let allSettingsByName:any;

        //add settings that should be loaded from the settings.txt file
        this.createSettings(globalSettings);

        filePath = join(pathToDataFolder, this._fileNameSettings);

        //load settings file and validate it
        settingsJSON = loadSettingsFile.loadJSONSync(filePath);
        validationResult = jsonValidation.validate(settingsJSON, globalSettings.getJsonWithAllSettingFileNamesAndVarTypes());

        //override the default-value for all globalSettings with the values loaded from the settings-file
        globalSettings.setValuesFromSettingsFileJSON(settingsJSON);

        if (!validationResult)
            this._settingsValidationErrors.push("no settings file found: " + filePath);
        else if (!validationResult.valid)
            this._settingsValidationErrors = validationResult.errors;
        else
            this._settingsValidationErrors = [""];

        allSettingsByName = globalSettings.getJsonWithAllNamesAndValues();

        ipcMain.handle('app:load-settings', (event, args) => {
            console.log("Main: send global-settings-json to renderer: ", allSettingsByName, pathToDataFolder, this._settingsValidationErrors);

            return {pathToDataFolder: pathToDataFolder, json: allSettingsByName, errorsInJson: this._settingsValidationErrors.toString()};
        });

        return allSettingsByName;
    }


    /**
     * adds the settings which should be loaded from the settings-file
     * Is in a separate function that it can be edited easily in projects
     */
    private createSettings(globalSettings: GlobalSettings) {
        let settings: any = GlobalSettingsFactory.getGlobalSettings();

        for (let i: number = 0; i < settings.length; i++)
            globalSettings.addSetting(settings[i]);
    }
}