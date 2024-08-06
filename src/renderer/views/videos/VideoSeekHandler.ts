const SEEK_CONFIG = {
    INSTANT_THRESHOLD: 0.1,
    GRADUAL_THRESHOLD: 5,
    INTERVAL_MS: 10,
    STEP_SIZE: 0.01,
    HIGH_DIFF: 3,
    MEDIUM_DIFF: 0.3,
    FAST_RATES: { HIGH: 1.2, MEDIUM: 1.1, LOW: 1.05 },
    SLOW_RATES: { HIGH: 0.8, MEDIUM: 0.9, LOW: 0.95 }
} ;

export class VideoSeekHandler {
    private _container: HTMLVideoElement;
    private _tempPlaybackRate: number | null = null;
    private _speedStep: number | null = null;
    private _catchUpDuration: number | null = null;
    private _speedInterval: NodeJS.Timeout | null = null;
    private _catchUpTimeout: NodeJS.Timeout | null = null;

    constructor(container: HTMLVideoElement) {
        this._container = container;
    }

    /**
     * Instantly jumps to the specified time position
     */
    public instantSeek(seconds: number): void {
        this.resetTimers();
        this._container.currentTime = seconds;
    }

    /**
     * Smoothly seeks to the specified time position using playback rate adjustment
     *
     * Info: adjusting the currentTime-value in an interval did not work smoothly so the solution was adjusting the playback-speed
     */
    public gradualSeek(seconds: number): void {
        const timeDiff:number = seconds - this._container.currentTime;
        this.resetTimers();

        if (Math.abs(timeDiff) < SEEK_CONFIG.INSTANT_THRESHOLD) return;

        if (Math.abs(timeDiff) < SEEK_CONFIG.GRADUAL_THRESHOLD) {
            this._startGradualSeek(timeDiff);
        } else {
            this._container.currentTime = seconds;
        }
    }

    public resetTimers(): void {
        if (this._speedInterval) clearInterval(this._speedInterval);
        if (this._catchUpTimeout) clearTimeout(this._catchUpTimeout);
        this._speedInterval = null;
        this._catchUpTimeout = null;
    }

    private _startGradualSeek(timeDiff: number): void {
        // Determine target playback rate based on time difference
        this._tempPlaybackRate = this._calculateTargetRate(timeDiff);
        this._speedStep = timeDiff > 0 ? SEEK_CONFIG.STEP_SIZE : -SEEK_CONFIG.STEP_SIZE;

        // Calculate how long to maintain the adjusted speed
        const speedAdjustTime = this._calculateSpeedAdjustmentTime();
        this._catchUpDuration = Math.max(0, (timeDiff / (this._tempPlaybackRate - 1)) * 1000 - speedAdjustTime);

        // Start gradually adjusting speed
        this._speedInterval = setInterval(() => this._adjustPlaybackSpeed(), SEEK_CONFIG.INTERVAL_MS);
    }

    private _calculateTargetRate(timeDiff: number): number {
        const absDiff:number = Math.abs(timeDiff);

        if (timeDiff > 0) {
            // Forward seeking
            if (absDiff > SEEK_CONFIG.HIGH_DIFF) return SEEK_CONFIG.FAST_RATES.HIGH;
            if (absDiff > SEEK_CONFIG.MEDIUM_DIFF) return SEEK_CONFIG.FAST_RATES.MEDIUM;
            return SEEK_CONFIG.FAST_RATES.LOW;
        } else {
            // Backward seeking
            if (absDiff > SEEK_CONFIG.HIGH_DIFF) return SEEK_CONFIG.SLOW_RATES.HIGH;
            if (absDiff > SEEK_CONFIG.MEDIUM_DIFF) return SEEK_CONFIG.SLOW_RATES.MEDIUM;
            return SEEK_CONFIG.SLOW_RATES.LOW;
        }
    }

    private _calculateSpeedAdjustmentTime(): number {
        const iterations:number = Math.abs(this._tempPlaybackRate! - this._container.playbackRate) / SEEK_CONFIG.STEP_SIZE;
        return iterations * SEEK_CONFIG.INTERVAL_MS;
    }

    private _adjustPlaybackSpeed(): void {
        this._container.playbackRate = Number((this._container.playbackRate + this._speedStep!).toFixed(2));

        const reachedTarget:boolean = this._speedStep! > 0
            ? this._container.playbackRate >= this._tempPlaybackRate!
            : this._container.playbackRate <= this._tempPlaybackRate!;

        if (reachedTarget) {
            this._container.playbackRate! = this._tempPlaybackRate as number;
            clearInterval(this._speedInterval!);
            this._speedInterval = null;

            this._catchUpTimeout = setTimeout(() => this._resetPlaybackRate(), this._catchUpDuration!);
        }
    }

    private _resetPlaybackRate(): void {
        this._container.playbackRate = 1;
    }
}