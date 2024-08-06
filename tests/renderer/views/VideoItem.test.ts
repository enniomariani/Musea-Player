/**
 * @jest-environment jsdom
 */

import {VideoSeekHandler} from "renderer/views/videos/VideoSeekHandler.js";
import {VideoItem} from "renderer/views/videos/VideoItem.js";

describe('VideoItem Class', () => {
    let videoItem: VideoItem;
    let mockContainer: HTMLVideoElement;
    let mockClassList: DOMTokenList;
    let seekHandlerMock: VideoSeekHandler;

    beforeEach(() => {

        seekHandlerMock = {
            instantSeek: jest.fn(),
            gradualSeek: jest.fn(),
            resetTimers: jest.fn()
        } as unknown as jest.Mocked<VideoSeekHandler>;

        mockClassList = {
            add: jest.fn()
        } as unknown as DOMTokenList;

        mockContainer = {
            src: 'test.mp4',
            style: {transition: ''},
            classList: mockClassList,
            pause: jest.fn(),
            play: jest.fn(),
            currentTime: 0,
            playbackRate: 1,
            muted: false,
            volume: 1,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        } as unknown as HTMLVideoElement;

        videoItem = new VideoItem('test.mp4', 1, mockContainer, seekHandlerMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should initialize correctly with a video source and fade time', () => {
        expect(videoItem.container.src).toBe('test.mp4');
        expect(videoItem.container.style.transition).toBe('opacity 1s ease-in-out');
        expect(mockContainer.pause).toHaveBeenCalled();
    });

    it('should show the video (change opacity to 1)', async ():Promise<void> => {
        jest.useFakeTimers();
        await videoItem.show();

        jest.advanceTimersByTime(50);

        expect(videoItem.container.style.opacity).toBe('1');
    });

    it('should fade out the video and dispatch an event', (done) => {
        const dispatchEventSpy = jest.spyOn(videoItem, 'dispatchEvent');

        jest.useFakeTimers();
        videoItem.fadeOut();

        jest.advanceTimersByTime(1000);

        expect(videoItem.container.style.opacity).toBe('0');
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: VideoItem.EVENT_VIDEO_FADED_OUT
        }));

        jest.useRealTimers();

        done();
    });

    it('should mute the video', () => {
        videoItem.mute();
        expect(videoItem.container.muted).toBe(true);
    });

    it('should unmute the video', () => {
        videoItem.unmute();
        expect(videoItem.container.muted).toBe(false);
    });

    it('should set the video volume within range', () => {
        videoItem.setVolume(0.5);
        expect(videoItem.container.volume).toBe(0.5);

        videoItem.setVolume(1.5); // Should clamp to 1
        expect(videoItem.container.volume).toBe(1);

        videoItem.setVolume(-0.5); // Should clamp to 0
        expect(videoItem.container.volume).toBe(0);
    });

    it('should play the video', async () => {
        await videoItem.play();
        expect(mockContainer.play).toHaveBeenCalled();
    });

    it('should not play if the video has ended', async () => {
        videoItem['_videoEnded'] = true;
        await videoItem.play();
        expect(mockContainer.play).not.toHaveBeenCalled();
    });

    it('should pause the video', () => {
        videoItem.pause();
        expect(mockContainer.pause).toHaveBeenCalled();
    });

    it('should forward the video playback rate to 2x', () => {
        videoItem.fwd();
        expect(videoItem.container.playbackRate).toBe(2);
    });

    it('should rewind the video by 0.2 seconds', () => {
        videoItem.container.currentTime = 1;
        videoItem.rew();

        // Simulating one call to _onRewind (100ms interval)
        videoItem['_onRewind']();

        expect(videoItem.container.currentTime).toBe(0.8);
    });

    it('should instantly seek to a specific time, if instant is true', () => {
        const seekSpy = jest.spyOn(seekHandlerMock, 'instantSeek');
        videoItem.seek(10, true);
        expect(seekSpy).toHaveBeenCalledWith(10);
    });

    it('should gradually seek to a specific time, if instant is false', () => {
        const seekSpy = jest.spyOn(seekHandlerMock, 'gradualSeek');
        videoItem.seek(10, false);
        expect(seekSpy).toHaveBeenCalledWith(10);
    });

    it('should clear intervals and timeouts when video is paused or faded out', () => {
        videoItem.play();
        videoItem.fadeOut();
        videoItem.pause();

        expect(mockContainer.pause).toHaveBeenCalled();
        expect(seekHandlerMock.resetTimers).toHaveBeenCalled();
    });

    it('should clear intervals and timeouts when video is paused or faded out, if it was rewinded before', () => {
        const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

        videoItem.play();
        videoItem.rew();
        videoItem.fadeOut();
        videoItem.pause();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should dispatch a video ended event when video ends', (done) => {
        const dispatchEventSpy = jest.spyOn(videoItem, 'dispatchEvent');
        videoItem['_onVideoEnded']();

        setTimeout(() => {
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
                type: VideoItem.EVENT_VIDEO_ENDED
            }));
            done();
        }, 100);
    });
});
