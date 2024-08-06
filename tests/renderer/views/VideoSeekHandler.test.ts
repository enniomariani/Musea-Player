import {VideoSeekHandler} from "renderer/views/videos/VideoSeekHandler.js";

describe('VideoSeekHandler', () => {
    let mockContainer: HTMLVideoElement;
    let seekHandler: VideoSeekHandler;
    let intervalID:any;

    beforeEach(() => {
        mockContainer = {
            currentTime: 0,
            playbackRate: 1,
        } as unknown as HTMLVideoElement;

        intervalID = setInterval(() => {
            console.log("update playhead: ",mockContainer.currentTime, mockContainer.playbackRate )
            mockContainer.currentTime += 0.033 * mockContainer.playbackRate; // ~33ms per frame at 30fps
        }, 33);
        
        seekHandler = new VideoSeekHandler(mockContainer);

        jest.useFakeTimers();
    });

    afterEach(() => {

        clearInterval(intervalID);

        jest.clearAllTimers();
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should reset the playback rate after the adjustment is complete', () => {
        mockContainer.currentTime = 0;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(2); // Seeking to 2 seconds

        // Simulate enough time for the playback rate to increase
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(200);

        // Playback rate should have started to increase
        expect(mockContainer.playbackRate).toBeGreaterThan(1);

        // Now simulate the timeout to check if playback rate resets
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(2100);
        expect(mockContainer.playbackRate).toBe(1); // Playback rate should reset to 1
    });

    it('should handle edge cases and no adjustment for time-differences smaller than 0.1 sec', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        // Time difference is too small, so no adjustment
        seekHandler.gradualSeek(10.05);

        expect(mockContainer.playbackRate).toBe(1); // Playback rate shouldn't change
        expect(mockContainer.currentTime).toBe(10); // Directly jump to the target time
    });

    it('should gradually increase playback rate for negative time difference: lesser than 0.3 sec', () => {
        mockContainer.currentTime = 5;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(5.2);

        // Simulate a few ticks
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 1
        expect(mockContainer.playbackRate).toBe(1.02);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 2
        expect(mockContainer.playbackRate).toBe(1.04);

        // After some time, playback rate should be closer to 0.9
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(100);
        expect(mockContainer.playbackRate).toBe(1.05);
    });

    it('should gradually increase playback rate for negative time difference: more than 0.3 sec', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(11); // Seek backward

        // Simulate a few ticks
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 1
        expect(mockContainer.playbackRate).toBe(1.02);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 2
        expect(mockContainer.playbackRate).toBe(1.04);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(100);
        expect(mockContainer.playbackRate).toBe(1.1);
    });

    it('should gradually increase playback rate for negative time difference: more than 3 sec', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(13.5)

        // Simulate a few ticks
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 1
        expect(mockContainer.playbackRate).toBe(1.02);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 2
        expect(mockContainer.playbackRate).toBe(1.04);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(1000);
        expect(mockContainer.playbackRate).toBe(1.2);
    });

    it('should gradually decrease playback rate for negative time difference: lessn than -0.3 sec', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(9.8); // Seek backward

        // Simulate a few ticks
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 1
        expect(mockContainer.playbackRate).toBe(0.98);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 2
        expect(mockContainer.playbackRate).toBe(0.96);

        // After some time, playback rate should be closer to 0.9
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(100);
        expect(mockContainer.playbackRate).toBe(0.95);
    });

    it('should gradually decrease playback rate for negative time difference: more than -0.3 sec', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(9); // Seek backward

        // Simulate a few ticks
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 1
        expect(mockContainer.playbackRate).toBe(0.98);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 2
        expect(mockContainer.playbackRate).toBe(0.96);

        // After some time, playback rate should be closer to 0.9
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(100);
        expect(mockContainer.playbackRate).toBe(0.9);
    });

    it('should gradually decrease playback rate for negative time difference: more than 3 sec', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(6.5); // Seek backward

        // Simulate a few ticks
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 1
        expect(mockContainer.playbackRate).toBe(0.98);

        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(10); // Tick 2
        expect(mockContainer.playbackRate).toBe(0.96);

        // After some time, playback rate should be closer to 0.9
        jest.runOnlyPendingTimers();
        jest.advanceTimersByTime(1000);
        expect(mockContainer.playbackRate).toBe(0.8);
    });

    it('should immediately jump to target time if time difference is too large', () => {
        mockContainer.currentTime = 0;
        mockContainer.playbackRate = 1;

        seekHandler.gradualSeek(100); // Large time difference

        // Directly jump to the target time
        expect(mockContainer.currentTime).toBe(100);
        expect(mockContainer.playbackRate).toBe(1); // No gradual adjustment since the time difference is large
    });

    it('should not adjust playback rate if seek is instant', () => {
        mockContainer.currentTime = 10;
        mockContainer.playbackRate = 1;

        seekHandler.instantSeek(20);

        expect(mockContainer.playbackRate).toBe(1); // No playback rate change
        expect(mockContainer.currentTime).toBe(20); // Directly jump to the target time
    });
});
