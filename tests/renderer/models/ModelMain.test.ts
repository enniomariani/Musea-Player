import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    IMediaParameter,
    IOnMediaCommand,
    IOnSystemCommand,
    ModelMain,
    NetworkCommand
} from "renderer/models/ModelMain.js";
import {MockCreateGlobalSettings} from "__mocks__/renderer/models/globaSettings/MockCreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MockMuseaServer} from "musea-server/mocks";
import {IMediaCommandReceived, MuseaServer} from "musea-server/renderer";
import {ISystemCommandReceived} from "musea-server/renderer";

let globalSettings: GlobalSettings;
let mockCreateGlobalSettings: MockCreateGlobalSettings;
let mockMuseaServer: MockMuseaServer;
let modelMain: ModelMain;

beforeEach(() => {
    globalSettings = new GlobalSettings();
    mockCreateGlobalSettings = new MockCreateGlobalSettings();
    mockMuseaServer = new MockMuseaServer();
    modelMain = new ModelMain(mockCreateGlobalSettings, globalSettings, mockMuseaServer as any as MuseaServer)
});

describe("loadSettings() ", () => {
    it("should call createGlobalSettings.create() ", async () => {
        mockCreateGlobalSettings.create.mockResolvedValue(globalSettings);
        globalSettings.errorsInJSON = "";
        await modelMain.loadSettings();
        expect(mockCreateGlobalSettings.create).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the property globalSettings.errorsInJSON returned from createGlobalSettings.create is not null", async () => {
        globalSettings.errorsInJSON = "ERROR";
        mockCreateGlobalSettings.create.mockResolvedValue(globalSettings);

        let logSpy = jest.spyOn(global.console, 'error');

        await modelMain.loadSettings();
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});

describe("Network-commands ", () => {
    describe("System-Commands - passing ", () => {
        it.each<[string[], NetworkCommand.Volume, number | null]>([
            [["volume", "mute"], NetworkCommand.Volume.Mute, null],
            [["volume", "unmute"], NetworkCommand.Volume.Unmute, null],
            [["volume", "set", "76"], NetworkCommand.Volume.Set, 76],
            [["volume", "set", "0"], NetworkCommand.Volume.Set, 0]
        ])(
            "%s should call systemCommand-callback with arguments %s and %p",
            async (networkCommand: string[], param1: NetworkCommand.Volume, param2: number | null) => {
                const callbackMock: IOnSystemCommand = jest.fn();

                mockMuseaServer.registerSystemCommandCallback.mockImplementation((callback: ISystemCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                })

                await modelMain.initFrameWork(jest.fn(), callbackMock, jest.fn());

                expect(callbackMock).toHaveBeenCalledTimes(1);
                expect(callbackMock).toHaveBeenCalledWith(param1, param2);
            });
    });

    describe("System-Commands - throwing ", () => {
        it.each<[string[]]>([
            [["invalid", "command"]],
            [[]],
            [["volume", "unknown-command"]],
        ])(
            "%p should throw an error",
            async (networkCommand: string[]) => {
                mockMuseaServer.registerSystemCommandCallback.mockImplementation((callback: ISystemCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                });

                await expect(
                    modelMain.initFrameWork(jest.fn(), jest.fn(), jest.fn())
                ).rejects.toThrow();
            }
        );
    });

    describe("Media-Commands (others than play) - passing ", () => {
        it.each<[string[], NetworkCommand.Media, any]>([
            [["pause"], NetworkCommand.Media.Pause, null],
            [["stop"], NetworkCommand.Media.Stop, null],
            [["forward"], NetworkCommand.Media.Fwd, null],
            [["rewind"], NetworkCommand.Media.Rew, null],
            [["seek", "10"], NetworkCommand.Media.Seek, 10],
            [["seek", "0"], NetworkCommand.Media.Seek, 0],
            [["subs"], NetworkCommand.Media.Subs, null],
            [["subs", "deu"], NetworkCommand.Media.Subs, "deu"],
            [["sync", "100"], NetworkCommand.Media.Sync, 100],
            [["sync", "0"], NetworkCommand.Media.Sync, 0],
        ])(
            "%s should call systemCommand-callback with arguments %s and %p",
            async (networkCommand: string[], param1: NetworkCommand.Media, value: any) => {
                const callbackMock: IOnMediaCommand = jest.fn();

                mockMuseaServer.registerMediaCommandCallback.mockImplementation((callback: IMediaCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                });

                await modelMain.initFrameWork(callbackMock, jest.fn(), jest.fn());

                expect(callbackMock).toHaveBeenCalledTimes(1);

                if (value !== null)
                    expect(callbackMock).toHaveBeenCalledWith(param1, {value: value});
                else
                    expect(callbackMock).toHaveBeenCalledWith(param1);
            });
    });

    describe("Media-Play-Commands - passing ", () => {
        const fileName:string = "fileName.jpeg";

        it.each<[string[], boolean, any, string | null, boolean]>([
            [["play"],  true, null, null, true],
            [["play", "0"], true, fileName, "jpeg", true],
            [["play", "20"], true, fileName, "jpeg", true],
            [["play", "0"],  false, "0", null, false],
            [["play", "20"],  false, "20", null, false],
        ])(
            "%s should call systemCommand-callback with arguments %s and %p",
            async (networkCommand: string[], mediaFound: boolean, value: any, mediaType: string | null, hasMedia: boolean) => {
                const callbackMock: IOnMediaCommand = jest.fn();

                if (value !== null){
                    mockMuseaServer.getMediaFileName.mockReturnValue(hasMedia ? fileName: null);
                    mockMuseaServer.getMediaType.mockReturnValue("jpeg");
                }

                mockMuseaServer.registerMediaCommandCallback.mockImplementation((callback: IMediaCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                })

                await modelMain.initFrameWork(callbackMock, jest.fn(), jest.fn());

                expect(callbackMock).toHaveBeenCalledTimes(1);
                expect(callbackMock).toHaveBeenCalledWith(NetworkCommand.Media.Play, {mediaFound: mediaFound, value: value, mediaType: mediaType});
            });
    });

    describe("Media-Commands - throwing ", () => {
        it.each<[string[]]>([
            [["invalid", "command"]],
            [["invalid"]],
            [[]],
            [["seek"]],
            [["sync"]],
            [["play", "non-number"]],
            [["seek", "non-number"]],
            [["sync", "non-number"]],
        ])(
            "%p should throw an error",
            async (networkCommand: string[]) => {
                mockMuseaServer.registerMediaCommandCallback.mockImplementation((callback: IMediaCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                });

                await expect(
                    modelMain.initFrameWork(jest.fn(), jest.fn(), jest.fn())
                ).rejects.toThrow();
            }
        );
    });
});

describe("Check onAdminAppDisconnected ", () => {
    it("should call onAdminAppDisconnected-callback", async () => {
        const callbackMock: IOnSystemCommand = jest.fn();

        mockMuseaServer.registerAdminAppDisconnectedCallback.mockImplementation((callback: any) => {
            callback();
        })

        await modelMain.initFrameWork(jest.fn(), jest.fn(), callbackMock);

        expect(callbackMock).toHaveBeenCalledTimes(1);
    });
});