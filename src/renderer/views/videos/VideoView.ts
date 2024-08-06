import {VideoItem} from "renderer/views/videos/VideoItem.js";

export class VideoView implements IPlayableMediaView {

    private _fadeTimeSec: number;
    private _container: HTMLDivElement;

    private _lastActiveVideo: VideoItem | null = null;
    private _activeVideo: VideoItem | null = null;

    private _onVideoEndedFunc = this._onVideoEnded.bind(this);
    private _onVideoFadedOutFunc = this._onVideoFadedOut.bind(this);

    constructor(container: HTMLDivElement, fadeTimeSec: number) {
        this._container = container;
        this._fadeTimeSec = fadeTimeSec;
    }

    /**
     * set the active video to the passed file path and deactivate + hide all other shown videos
     */
    async show(videoFilePath: string): Promise<void> {
        const videoItem: VideoItem = new VideoItem(videoFilePath, this._fadeTimeSec);

        if(this._activeVideo !== null)
            this._lastActiveVideo = this._activeVideo;

        // Add the video to the container, and fade it in
        this._container.appendChild(videoItem.container);
        this._activeVideo = videoItem;
        this._activeVideo.addEventListener(VideoItem.EVENT_VIDEO_ENDED, this._onVideoEndedFunc);
        this._activeVideo.addEventListener(VideoItem.EVENT_VIDEO_FADED_OUT, this._onVideoFadedOutFunc);

        if (this._lastActiveVideo !== null){
            this._hideVideo(this._lastActiveVideo);
            this._lastActiveVideo = null;
        }

        await this._activeVideo.show();
    }

    hide(): void {
        if (!this._activeVideo)
            return;

        this._hideVideo(this._activeVideo);
        this._activeVideo = null;
    }

    private _hideVideo(video: VideoItem): void {
        video.removeEventListener(VideoItem.EVENT_VIDEO_ENDED, this._onVideoEndedFunc);
        video.fadeOut();
    }

    private _onVideoEnded(event: Event): void {
        const video:VideoItem = event.target as VideoItem;

        video.removeEventListener(VideoItem.EVENT_VIDEO_ENDED, this._onVideoEndedFunc);
        video.fadeOut();
    }

    private _onVideoFadedOut(event: Event):void{
        const video:VideoItem = event.target as VideoItem;

        video.removeEventListener(VideoItem.EVENT_VIDEO_FADED_OUT, this._onVideoFadedOutFunc);
        this._container.removeChild(video.container);
    }

    async play(): Promise<void> {
        if (!this._activeVideo)
            return;

        await this._activeVideo.play();
    }

    pause(): void {
        if (!this._activeVideo)
            return;

        this._activeVideo.pause();
    }

    fwd(): void {
        if (!this._activeVideo)
            return;

        this._activeVideo.fwd();
    }

    rew(): void {
        if (!this._activeVideo)
            return;

        this._activeVideo.rew();
    }

    /**
     * moves the playhead of the video to the passed seconds
     *
     * if instant is false, the speed of the video increases or decreases until the playhead catches up with the passed seconds-value
     * if the instant is false and the time-difference between the actual playhead and the passed seconds is bigger than 10 seconds, the jump is hard, without a gradual shift
     */
    seek(seconds: number, instant: boolean): void {
        if (!this._activeVideo)
            return;

        this._activeVideo.seek(seconds, instant);
    }

    setVolume(newVolume: number): void {
        if (!this._activeVideo)
            return;

        this._activeVideo.setVolume(newVolume);
    }

    mute(): void {
        if (this._activeVideo)
            this._activeVideo.mute();
    }

    unmute(): void {
        if (this._activeVideo)
            this._activeVideo.unmute();
    }
}