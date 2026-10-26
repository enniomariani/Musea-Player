import {ExtractedSub} from "../shared/types.js";

export {};

declare global {
    interface Window {
        backend:IBackend;
    }

    interface IBackend {
        loadSettings():Promise<IBackendData>;
        extractSubsForFile(filePath:string):Promise<ExtractedSub[]>;
    }

    interface IBackendData{
        pathToDataFolder: string;
        bgImageName: string;
        json: any;
        errorsInJson: string;
    }
}