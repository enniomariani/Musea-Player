export class ImageItem  extends EventTarget{

    public static EVENT_IMG_FADED_OUT: string = "imgFadedOut";

    private _container:HTMLImageElement;
    private _fadeTimeSec:number;

    constructor(path:string, fadeTimeSec:number, container?:HTMLImageElement) {
        super();

        this._fadeTimeSec = fadeTimeSec;
        this._container = container || new Image();

        this._container.src = path;
        this._container.classList.add('image'); // Add the base class, see main.css
        this._container.style.opacity = "0";
        this._container.style.transition = "opacity "+ this._fadeTimeSec.toString() +"s ease-in-out";
    }

    show(): void {
        setTimeout(() => {
            if (this._container) {
                this._container.style.opacity = "1";
            }
        }, 50); // Small delay to ensure rendering
    }

    fadeOut(): void {
        this._container.style.opacity = "0";

        setTimeout(() => {
            this.dispatchEvent(new Event(ImageItem.EVENT_IMG_FADED_OUT));
        }, this._fadeTimeSec * 1000);
    }

    get container(): HTMLImageElement {
        return this._container;
    }
}