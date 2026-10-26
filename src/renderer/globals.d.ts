import {ExtractedSub} from "../shared/types.js";

export {};

declare global {
    interface Window {
        backend:IBackend;
    }

    interface IBackend {
        loadSettings():Promise<IBackendData>;
        loadTheme():Promise<any|null>;
        extractSubsForFile(filePath:string):Promise<ExtractedSub[]>;
        getResourcePath(relativePath:string):Promise<string>;
    }

    interface IBackendData{
        pathToDataFolder: string;
        bgImageName: string;
        json: any;
        errorsInJson: string;
    }
}