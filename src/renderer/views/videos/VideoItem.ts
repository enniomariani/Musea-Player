import {VideoSeekHandler} from "renderer/views/videos/VideoSeekHandler.js";

export class VideoItem extends EventTarget {
    public static EVENT_VIDEO_ENDED: string = "videoEnded";
    public static EVENT_VIDEO_FADED_OUT: string = "videoFadedOut";

    private _fadeTimeSec: number;
    private _container: HTMLVideoElement;
    private _videoEnded: boolean;

    private _rewindIntervalID:number | null = null;

    private _seekHandler:VideoSeekHandler;

    private _onVideoEndedFunc:any;

    constructor(sourcePath: string, fadeTimeSec: number, container?: HTMLVideoElement, seekHandler?:VideoSeekHandler) {
        super();
        this._fadeTimeSec = fadeTimeSec;

        this._onVideoEndedFunc = this._onVideoEnded.bind(this);

        this._container = container || document.createElement('video');
        this._container.src = sourcePath;
        this._container.classList.add('video');
        this._container.addEventListener('ended', this._onVideoEndedFunc);
        this._container.style.opacity = "0";
        this._container.style.transition = "opacity "+ this._fadeTimeSec.toString() +"s ease-in-out";
        this._container.pause();
        this._container.currentTime = 0;
        this._container.playbackRate = 1;
        this._videoEnded = false;

        this._seekHandler = seekHandler || new VideoSeekHandler(this._container);
    }

    async show(): Promise<void> {
        this._clearIntervalsAndTimeouts();

        setTimeout(() => {
            if (this._container) {
                this._container.style.opacity = "1";
            }
        }, 50); // Small delay to ensure rendering
    }

    fadeOut(): void {
        this._clearIntervalsAndTimeouts();
        this._container.removeEventListener('ended', this._onVideoEndedFunc);
        this._container.style.opacity = "0";

        setTimeout(() => {
            this._container.pause();
            this.dispatchEvent(new Event(VideoItem.EVENT_VIDEO_FADED_OUT));
        }, this._fadeTimeSec * 1000);
    }

    mute(): void {
        this._container.muted = true;
    }

    unmute(): void {
        this._container.muted = false;
    }

    setVolume(newVolume: number): void {
        this._container.volume = Math.min(Math.max(newVolume, 0), 1);
    }

    private _onVideoEnded = (): void => {
        this._container.removeEventListener('ended', this._onVideoEndedFunc);
        this._videoEnded = true;
        this.dispatchEvent(new Event(VideoItem.EVENT_VIDEO_ENDED));
    };

    async play(): Promise<void> {
        if (this._videoEnded) return;

        this._clearIntervalsAndTimeouts();
        this._container.playbackRate = 1;

        try {
            await this._container.play();
        } catch (err) {
            console.error('Video play failed: ', err);
        }
    }

    pause(): void {
        this._container.pause();
        this._clearIntervalsAndTimeouts();
    }

    fwd(): void {
        this._clearIntervalsAndTimeouts();
        this._container.playbackRate = 2;
    }

    rew(): void {
        this._clearIntervalsAndTimeouts();
        this._container.pause();
        this._rewindIntervalID = window.setInterval(this._onRewind.bind(this), 100);
    }

    private _onRewind = (): void => {
        if (this._container.currentTime >= 0.2) {
            this._container.currentTime -= 0.2;
        }
    };

    seek(seconds: number, instant: boolean): void {
        if(instant)
            this._seekHandler.instantSeek(seconds);
        else
            this._seekHandler.gradualSeek(seconds);
    }

    private _clearIntervalsAndTimeouts() {
        if (this._rewindIntervalID)
            clearInterval(this._rewindIntervalID);

        this._seekHandler.resetTimers();
    }

    get container(): HTMLVideoElement {
        return this._container;
    }
}