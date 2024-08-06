import {ImageView} from "renderer/views/images/ImageView.js";
import {VideoView} from "renderer/views/videos/VideoView.js";

export class ViewMain {

    private _errorEl: HTMLDivElement | null = null;

    private _fadeTimeSec:number | null = null;

    private _imageView:IMediaView | null = null;
    private _videoView:IPlayableMediaView | null = null;

    constructor() {}

    init(fadeTimeSec: number, pathToDataFolder:string, imageName:string): void {
        const imgContainer:HTMLDivElement = document.getElementById('image-container') as HTMLDivElement;
        const videoContainer:HTMLDivElement  = document.getElementById('video-container') as HTMLDivElement;

        this._fadeTimeSec = fadeTimeSec;

        if(imageName !== ""){
            const pathToBgImage:string = pathToDataFolder + imageName;
            const fileUrl = `file://${encodeURI(pathToBgImage.replace(/\\/g, '/'))}`;

            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundPosition = "center center";
            document.body.style.backgroundImage = `url('${fileUrl}')`;
        }

        this._errorEl = document.getElementById("error") as HTMLDivElement;

        this._videoView = new VideoView(videoContainer, this._fadeTimeSec);
        this._imageView = new ImageView(imgContainer, this._fadeTimeSec);
    }

    showError(error: string): void {
        if(this._errorEl)
            this._errorEl.textContent = error;
    }

    showImage(imgPath: string): void {
       this._imageView?.show(imgPath);
    }

    hideImage(): void {
        this._imageView?.hide();
    }

    /**
     * if videoFilePath is null, play the actual video (if there is any)
     * @param videoFilePath
     */
    async playVideo(videoFilePath: string | null): Promise<void> {
        if(videoFilePath !== null)
            this._videoView?.show(videoFilePath);

        await this._videoView?.play();
    }

    stopVideo(): void {
        this._videoView?.hide();
    }

    pauseVideo(): void {
        this._videoView?.pause();
    }

    forwardVideo(): void {
        this._videoView?.fwd();
    }

    rewindVideo(): void {
        this._videoView?.rew();
    }

    /**
     * moves the playhead of the video to the passed seconds
     *
     * if fade is true, the speed of the video increases or decreases until the playhead catches up with the passed seconds-value
     * if the fade is true and the time-difference between the actual playhead and the passed seconds is bigger than 10 seconds, the jump is hard, without a fade
     *
     * @param {number} seconds
     * @param {boolean} fade
     */
    seek(seconds: number, fade: boolean): void {
        this._videoView?.seek(seconds, fade);
    }

    mute(): void {
        this._videoView?.mute();
    }

    unmute(): void {
        this._videoView?.unmute();
    }

    setVolume(newVolume: number): void {
        this._videoView?.setVolume(newVolume);
    }
}