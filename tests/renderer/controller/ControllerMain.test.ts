import {beforeEach, describe, expect, it} from "@jest/globals";
import {IOnMediaCommand, IOnSystemCommand, NetworkCommand} from "renderer/models/ModelMain.js";
import {ControllerMain} from "renderer/controllers/ControllerMain.js";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";
import {MockViewMain} from "__mocks__/renderer/views/MockViewMain.js";

let controllerMain: ControllerMain;
let mockModelMain: MockModelMain;
let mockViewMain: MockViewMain;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    mockViewMain = new MockViewMain();
    mockViewMain.playVideo.mockResolvedValue(null);
    controllerMain = new ControllerMain(mockModelMain, mockViewMain);
});

describe("Network-commands ", () => {

    describe("System commands ", () => {
        it.each<[NetworkCommand.Volume, param: number | null, () => Function]>([
            [NetworkCommand.Volume.Mute, null, () => mockViewMain.mute],
            [NetworkCommand.Volume.Unmute, null, () => mockViewMain.unmute],
            [NetworkCommand.Volume.Set, 10, () => mockViewMain.setVolume]
        ])(
            "%s should call corresponding view-method with %p",
            async (networkCommand: NetworkCommand.Volume, param: number | null, getViewMethod: () => Function) => {
                const viewMethod = getViewMethod();

                mockModelMain.initFrameWork.mockImplementation((onMediaCommand: IOnMediaCommand, onSystemCommandReceived: IOnSystemCommand,
                                                                onAdminAppDisconnected: Function) => {
                    onSystemCommandReceived(networkCommand, param)
                })

                await controllerMain.init();

                expect(viewMethod).toHaveBeenCalledTimes(1);

                if (param !== null)
                    expect(viewMethod).toHaveBeenCalledWith(param);
            });
    });

    describe("Media commands - check play ", () => {
        it.each<[NetworkCommand.Media, boolean, any, string | null, () => Function]>([
            [NetworkCommand.Media.Play, false, null, null, () => mockViewMain.showError],
            [NetworkCommand.Media.Play, true, null, null, () => mockViewMain.playVideo],    //if only a play-signal is received, the media has to be a video, because images cannot be paused
            [NetworkCommand.Media.Play, true, 1, "jpeg", () => mockViewMain.showImage],
            [NetworkCommand.Media.Play, true, 1, "png", () => mockViewMain.showImage],
            [NetworkCommand.Media.Play, true, 1, "mp4", () => mockViewMain.playVideo],
        ])(
            "%s should call corresponding view-method with %p",
            async (command: NetworkCommand.Media, mediaFileFound: boolean, param: any, mediaType: string | null, getViewMethod: () => Function) => {
                const viewMethod: Function = getViewMethod();

                mockModelMain.initFrameWork.mockImplementation((onMediaCommand: IOnMediaCommand, onSystemCommandReceived: IOnSystemCommand,
                                                                onAdminAppDisconnected: Function) => {
                    onMediaCommand(command, mediaFileFound, param, mediaType);
                })

                await controllerMain.init();

                expect(viewMethod).toHaveBeenCalledTimes(1);
            });
    });

    describe("Media commands - check while playing a video ", () => {
        it.each<[NetworkCommand.Media, any, string | null, () => Function]>([
            [NetworkCommand.Media.Pause, null, null, () => mockViewMain.pauseVideo],
            [NetworkCommand.Media.Fwd, null, null, () => mockViewMain.forwardVideo],
            [NetworkCommand.Media.Rew, null, null, () => mockViewMain.rewindVideo],
            [NetworkCommand.Media.Seek, 10, null, () => mockViewMain.seek],
            [NetworkCommand.Media.Seek, 0, null, () => mockViewMain.seek],
            [NetworkCommand.Media.Sync, 0, null, () => mockViewMain.seek],
            [NetworkCommand.Media.Stop, 0, null, () => mockViewMain.stopVideo],
        ])(
            "%s should call corresponding view-method with %p",
            async (command: NetworkCommand.Media, param: any, mediaType: string | null, getViewMethod: () => Function) => {
                const viewMethod: Function = getViewMethod();

                mockModelMain.initFrameWork.mockImplementation(async (onMediaCommand: IOnMediaCommand, onSystemCommandReceived: IOnSystemCommand,
                                                                      onAdminAppDisconnected: Function) => {
                    await onMediaCommand(NetworkCommand.Media.Play, true, 10, "mp4");
                    await onMediaCommand(command, true, param, mediaType);

                })

                await controllerMain.init();

                expect(viewMethod).toHaveBeenCalledTimes(1);
            });
    });

    describe("Media commands - check while playing an image ", () => {
        it.each<[NetworkCommand.Media, any, string | null, () => Function, (() => Function) | null]>([
            [NetworkCommand.Media.Pause, null, null, () => mockViewMain.pauseVideo, null],
            [NetworkCommand.Media.Fwd, null, null, () => mockViewMain.forwardVideo, null],
            [NetworkCommand.Media.Rew, null, null, () => mockViewMain.rewindVideo, null],
            [NetworkCommand.Media.Seek, 10, null, () => mockViewMain.seek, null],
            [NetworkCommand.Media.Sync, 0, null, () => mockViewMain.seek, null],
            [NetworkCommand.Media.Stop, 0, null, () => mockViewMain.stopVideo, () => mockViewMain.hideImage],
        ])(
            "%s should call corresponding view-method with %p",
            async (command: NetworkCommand.Media, param: any, mediaType: string | null, getViewMethodNotCalled: () => Function, getViewMethod: (() => Function) | null) => {

                mockModelMain.initFrameWork.mockImplementation(async (onMediaCommand: IOnMediaCommand, onSystemCommandReceived: IOnSystemCommand,
                                                                      onAdminAppDisconnected: Function) => {
                    await onMediaCommand(NetworkCommand.Media.Play, true, 10, "jpeg");
                    await onMediaCommand(command, true, param, mediaType);
                });

                await controllerMain.init();

                const viewMethodDoNotCall: Function = getViewMethodNotCalled();
                expect(viewMethodDoNotCall).toHaveBeenCalledTimes(0);

                if (getViewMethod !== null) {
                    const viewMethodDoCall: Function = getViewMethod();
                    expect(viewMethodDoCall).toHaveBeenCalledTimes(1);
                }
            });
    });
});