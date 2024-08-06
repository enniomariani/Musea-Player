export class GlobalSettings {
    private _pathToDataFolder:string = "";
    private _errorsInJSON:string = "";
    private _bgImageName:string = "";

    constructor() {}

    get errorsInJSON(): string {
        return this._errorsInJSON;
    }

    set errorsInJSON(value: string) {
        this._errorsInJSON = value;
    }

    get pathToDataFolder(): string {
        return this._pathToDataFolder;
    }

    set pathToDataFolder(value: string) {
        this._pathToDataFolder = value;
    }

    get bgImageName(): string {
        return this._bgImageName;
    }

    set bgImageName(value: string) {
        this._bgImageName = value;
    }
}
