export {};

declare global {
    interface Window {
        backend:IBackend;
    }

    interface IBackend {
        loadSettings():Promise<IBackendData>;
        extractSubsForFile(filePath:string):Promise<[]>;
    }

    interface IBackendData{
        pathToDataFolder: string;
        bgImageName: string;
        json: any;
        errorsInJson: string;
    }
}