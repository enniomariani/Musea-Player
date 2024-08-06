export {};

declare global {
    interface Window {
        backend:IBackend;
    }

    interface IBackend {
        loadSettings():IBackendData;
    }

    interface IBackendData{
        pathToDataFolder: string;
        bgImageName: string;
        json: any;
        errorsInJson: string;
    }
}