import {ModelMain, NetworkCommand} from "renderer/models/ModelMain.js";
import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {ViewMain} from "renderer/views/ViewMain.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";

export class ControllerMain {
    private _modelMain: ModelMain;
    private _viewMain: ViewMain;

    private _actualShownMediaType: string | null = null;

    constructor(modelMain: ModelMain = new ModelMain(new CreateGlobalSettings(new GlobalSettings(), window.backend), new GlobalSettings()), viewMain: ViewMain = new ViewMain()) {
        this._modelMain = modelMain;
        this._viewMain = viewMain;
    }

    async init(): Promise<void> {
        await this._modelMain.loadSettings();
        await this._modelMain.initFrameWork(this._mediaCommandReceived.bind(this), this._systemCommandReceived.bind(this), this._onAdminAppDisconnected.bind(this));

        this._viewMain.init(1, this._modelMain.globalSettings.pathToDataFolder, this._modelMain.globalSettings.bgImageName);
    }

    private _systemCommandReceived(command: NetworkCommand.Volume, parameter: number | null): void {
        switch (command) {
            case NetworkCommand.Volume.Mute:
                this._viewMain.mute();
                break;
            case NetworkCommand.Volume.Unmute:
                this._viewMain.unmute();
                break;
            case NetworkCommand.Volume.Set:
                if (parameter !== null)
                    this._viewMain.setVolume(parameter);
                break;
            default:
                throw new Error("Unknown system-command: " + command);
        }
    }

    private async _mediaCommandReceived(command: NetworkCommand.Media, mediaFound: boolean, parameter: any, mediaType: string | null): Promise<void> {
        switch (command) {
            case NetworkCommand.Media.Play:
                await this._handlePlayCommand(mediaFound, parameter, mediaType);
                break;
            case NetworkCommand.Media.Pause:
                if (this._isPlayingVideo())
                    this._viewMain.pauseVideo();
                break;
            case NetworkCommand.Media.Fwd:
                if (this._isPlayingVideo())
                    this._viewMain.forwardVideo();
                break;
            case NetworkCommand.Media.Rew:
                if (this._isPlayingVideo())
                    this._viewMain.rewindVideo();
                break;
            case NetworkCommand.Media.Seek:
                if (this._isPlayingVideo() && parameter >= 0)
                    this._viewMain.seek(parameter, true);
                break;
            case NetworkCommand.Media.Sync:
                if (this._isPlayingVideo())
                    this._viewMain.seek(parameter / 1000, false);
                break;
            case NetworkCommand.Media.Stop:
                this._stopActualMedia();
                break;
        }
    }

    private async _handlePlayCommand(mediaFound: boolean, parameter: any, mediaType: string | null): Promise<void> {
        if (!mediaFound) {
            this._actualShownMediaType = null;
            this._viewMain.showError("Bild oder Video ist nicht vorhanden in dieser Medien-App: " + parameter);
            return;
        }

        if (!parameter) {
            await this._viewMain.playVideo(null);
            return;
        }

        if (mediaType === "jpeg" || mediaType === "png") {
            this._stopActualMedia();
            this._viewMain.showImage(this._modelMain.globalSettings.pathToDataFolder + "media\\" + parameter);
        } else if (mediaType === "mp4") {
            this._stopActualMedia();
            await this._viewMain.playVideo(this._modelMain.globalSettings.pathToDataFolder + "media\\" + parameter);
            this._viewMain.unmute();
        } else
            throw new Error("Unknown media-Type: " + mediaType)

        this._actualShownMediaType = mediaType;
    }

    private _isPlayingVideo(): boolean {
        return this._actualShownMediaType === "mp4";
    }

    private _onAdminAppDisconnected(): void {
        this._stopActualMedia();
    }

    private _stopActualMedia(): void {
        if (this._actualShownMediaType === "jpeg" || this._actualShownMediaType === "png")
            this._viewMain.hideImage();
        else if (this._isPlayingVideo())
            this._viewMain.stopVideo();

        this._actualShownMediaType = null;
    }
}