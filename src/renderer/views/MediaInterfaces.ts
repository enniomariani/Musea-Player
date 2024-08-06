interface IMediaView {
    show(path: string): void;
    hide(): void;
}

interface IPlayableMediaView extends IMediaView {
    play(): Promise<void>;
    pause(): void;
    rew(): void;
    fwd(): void;
    seek(seconds: number, fade:boolean): void;
    mute(): void;
    unmute():void;
    setVolume(volume: number): void;
}