import {ViewMain} from "renderer/views/ViewMain.js";

export class MockViewMain extends ViewMain {
    init: jest.Mock;
    showError: jest.Mock;

    showImage: jest.Mock;
    hideImage: jest.Mock;

    playVideo: jest.Mock;
    stopVideo: jest.Mock;
    pauseVideo: jest.Mock;
    forwardVideo: jest.Mock;
    rewindVideo: jest.Mock;
    seek: jest.Mock;

    mute: jest.Mock;
    unmute: jest.Mock;
    setVolume: jest.Mock;

    constructor() {

        super();

        this.init = jest.fn();
        this.showError = jest.fn();

        this.showImage = jest.fn();
        this.hideImage = jest.fn();

        this.playVideo = jest.fn();
        this.stopVideo = jest.fn();
        this.pauseVideo = jest.fn();
        this.forwardVideo = jest.fn();
        this.rewindVideo = jest.fn();
        this.seek = jest.fn();

        this.mute = jest.fn();
        this.unmute = jest.fn();
        this.setVolume = jest.fn();
    }
}