import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {IOnMediaCommand, IOnSystemCommand, ModelMain, NetworkCommand} from "renderer/models/ModelMain.js";
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
        it.each<[string[], NetworkCommand.Media, boolean, any]>([
            [["pause"], NetworkCommand.Media.Pause, false, null],
            [["stop"], NetworkCommand.Media.Stop, false, null],
            [["forward"], NetworkCommand.Media.Fwd, false, null],
            [["rewind"], NetworkCommand.Media.Rew, false, null],
            [["seek", "10"], NetworkCommand.Media.Seek, false, 10],
            [["seek", "0"], NetworkCommand.Media.Seek, false, 0],
            [["sync", "100"], NetworkCommand.Media.Sync, false, 100],
            [["sync", "0"], NetworkCommand.Media.Sync, false, 0],
        ])(
            "%s should call systemCommand-callback with arguments %s and %p",
            async (networkCommand: string[], param1: NetworkCommand.Media, param2: boolean, param3: any) => {
                const callbackMock: IOnMediaCommand = jest.fn();

                mockMuseaServer.registerMediaCommandCallback.mockImplementation((callback: IMediaCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                })

                await modelMain.initFrameWork(callbackMock, jest.fn(), jest.fn());

                expect(callbackMock).toHaveBeenCalledTimes(1);
                expect(callbackMock).toHaveBeenCalledWith(param1, param2, param3, null);
            });
    });

    describe("Media-Play-Commands - passing ", () => {
        const fileName:string = "fileName.jpeg";

        it.each<[string[], NetworkCommand.Media, boolean, any, string | null, boolean]>([
            [["play"], NetworkCommand.Media.Play, true, null, null, true],
            [["play", "0"], NetworkCommand.Media.Play, true, fileName, "jpeg", true],
            [["play", "20"], NetworkCommand.Media.Play, true, fileName, "jpeg", true],
            [["play", "0"], NetworkCommand.Media.Play, false, "0", null, false],
            [["play", "20"], NetworkCommand.Media.Play, false, "20", null, false],
        ])(
            "%s should call systemCommand-callback with arguments %s and %p",
            async (networkCommand: string[], param1: NetworkCommand.Media, param2: boolean, param3: any, param4: string | null, hasMedia: boolean) => {
                const callbackMock: IOnMediaCommand = jest.fn();

                if (param3 !== null){
                    mockMuseaServer.getMediaFileName.mockReturnValue(hasMedia ? fileName: null);
                    mockMuseaServer.getMediaType.mockReturnValue("jpeg");
                }

                mockMuseaServer.registerMediaCommandCallback.mockImplementation((callback: IMediaCommandReceived) => {
                    callback("mock-ip-address", networkCommand);
                })

                await modelMain.initFrameWork(callbackMock, jest.fn(), jest.fn());

                expect(callbackMock).toHaveBeenCalledTimes(1);
                expect(callbackMock).toHaveBeenCalledWith(param1, param2, param3, param4);
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
    it("should call onAdminAppDisconnected-callback", async ()  => {
            const callbackMock: IOnSystemCommand = jest.fn();

            mockMuseaServer.registerAdminAppDisconnectedCallback.mockImplementation((callback: any) => {
                callback();
            })

            await modelMain.initFrameWork(jest.fn(), jest.fn(), callbackMock);

            expect(callbackMock).toHaveBeenCalledTimes(1);
        });
});