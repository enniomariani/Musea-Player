import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MuseaServer} from "musea-server/renderer";

export namespace NetworkCommand {
    export enum Media {
        Play = "play",
        Pause = "pause",
        Stop = "stop",
        Rew = "rew",
        Fwd = "fwd",
        Sync = "sync",
        Seek = "seek"
    }

    export enum Volume {
        Mute = "mute",
        Unmute = "unmute",
        Set = "setVolume"
    }
}

export interface IOnMediaCommand {
    (command: NetworkCommand.Media, mediaFileFound: boolean, parameter: any, mediaType: string | null): void
}

export interface IOnSystemCommand {
    (command: NetworkCommand.Volume, parameter: number | null): void
}

export class ModelMain extends EventTarget {
    private _globalSettings: GlobalSettings;
    private _createGlobalSettings: CreateGlobalSettings;

    private _museaServer: MuseaServer;

    private _onMediaCommandReceivedCallback: IOnMediaCommand | null = null;
    private _onSystemCommandReceivedCallback: IOnSystemCommand | null = null;
    private _onAdminAppDisconnectedCallback: Function | null = null;

    constructor(createGlobalSettings: CreateGlobalSettings, globalSettings: GlobalSettings, museaServer: MuseaServer = new MuseaServer()) {
        super();
        this._globalSettings = globalSettings;
        this._createGlobalSettings = createGlobalSettings;
        this._museaServer = museaServer;
    }

    async loadSettings() {
        this._globalSettings = await this._createGlobalSettings.create();

        if (this._globalSettings.errorsInJSON === "")
            console.log("settings.txt loaded successfully - no errors in the settings.txt-file: ", this._globalSettings);
        else
            console.error("Errors in the settings.txt, use default-settings: ", this._globalSettings);
    }

    async initFrameWork(onMediaCommandReceived: IOnMediaCommand, onSystemCommandReceived: IOnSystemCommand,
                        onAdminAppDisconnected: Function) {
        this._onMediaCommandReceivedCallback = onMediaCommandReceived;
        this._onSystemCommandReceivedCallback = onSystemCommandReceived;
        this._onAdminAppDisconnectedCallback = onAdminAppDisconnected;

        this._museaServer.registerMediaCommandCallback(this._onMediaCommandReceived.bind(this));
        this._museaServer.registerSystemCommandCallback(this._onSystemCommandReceived.bind(this));
        this._museaServer.registerAdminAppDisconnectedCallback(this._onAdminAppDisconnected.bind(this));
        await this._museaServer.start(this._globalSettings.pathToDataFolder, {
            port: 5000,
            lightInitSequence: true
        });
    }

    private _onMediaCommandReceived(ip: string, command: string[]): void {
        if (!command.length)
            throw new Error("Unknown command received: " + command);

        switch (command[0]) {
            case   "play":
                this._handlePlayCommandReceived(command);
                break;
            case   "pause":
                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Pause, false, null, null)
                break;
            case   "forward":
                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Fwd, false, null, null)
                break;
            case   "rewind":
                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Rew, false, null, null)
                break;
            case   "seek":
                if(command.length < 2 || isNaN(Number(command[1])))
                    throw new Error("Seek-command needs a following number: " + command);

                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Seek, false, Number(command[1]), null)
                break;
            case   "sync":
                if(command.length < 2 || isNaN(Number(command[1])))
                    throw new Error("Sync-command needs a following number: " + command);

                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Sync, false, Number(command[1]), null)
                break;
            case   "stop":
                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Stop, false, null, null)
                break;
            default:
                throw new Error("Unknown media-command: " + command)
        }
    }

    private _handlePlayCommandReceived(command: string[]): void {
        if (command.length > 1) {

            if(isNaN(Number(command[1])))
                throw new Error("Play-command needs a following number: " + command);

            const mediaFileName: string | null = this._museaServer.getMediaFileName(Number(command[1]));
            const mediaType: string | null = this._museaServer.getMediaType(Number(command[1]));

            if (mediaFileName !== null)
                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Play, true, mediaFileName, mediaType);
            else
                this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Play, false, command[1], null);
        } else
            this._onMediaCommandReceivedCallback!(NetworkCommand.Media.Play, true, null, null);
    }

    private _onSystemCommandReceived(ip: string, command: string[]): void {
        if (command.length <= 0 || command[0] !== "volume")
            throw new Error("Unknown command received: " + command);

        switch (command[1]) {
            case   "mute":
                this._onSystemCommandReceivedCallback!(NetworkCommand.Volume.Mute, null);
                break;
            case   "unmute":
                this._onSystemCommandReceivedCallback!(NetworkCommand.Volume.Unmute, null);
                break;
            case   "set":
                this._onSystemCommandReceivedCallback!(NetworkCommand.Volume.Set, Number(command[2]));
                break;
            default:
                throw new Error("unknown system-command: " + command)
        }
    }

    private _onAdminAppDisconnected(): void {
        if (this._onAdminAppDisconnectedCallback)
            this._onAdminAppDisconnectedCallback();
    }

    get globalSettings(): GlobalSettings {
        return this._globalSettings;
    }
}