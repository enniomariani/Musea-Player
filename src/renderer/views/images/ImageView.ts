import {ImageItem} from "renderer/views/images/ImageItem.js";

export class ImageView implements IMediaView{

    private _container:HTMLDivElement;
    private _fadeTimeSec:number;

    private _lastActiveImage: ImageItem | null = null;
    private _activeImage: ImageItem | null = null;

    private _onImgFadedOutFunc:any;

    constructor(imgContainer:HTMLDivElement, fadeTimeSec:number) {
        this._container = imgContainer;
        this._fadeTimeSec = fadeTimeSec;

        this._onImgFadedOutFunc = this._onImgFadedOut.bind(this);
    }

    show(path: string): void {
        const imgItem: ImageItem = new ImageItem(path, this._fadeTimeSec);

        if(this._activeImage !== null)
            this._lastActiveImage = this._activeImage;

        this._container.appendChild(imgItem.container);
        this._activeImage = imgItem;
        this._activeImage.addEventListener(ImageItem.EVENT_IMG_FADED_OUT, this._onImgFadedOutFunc);

        if (this._lastActiveImage !== null){
            this._lastActiveImage.fadeOut();
            this._lastActiveImage = null;
        }

        this._activeImage.show();
    }

    hide(): void {
        if (this._activeImage !== null){
            this._activeImage.fadeOut();
            this._activeImage = null;
        }
    }

    private _onImgFadedOut(event:Event):void{
        const img:ImageItem = event.target as ImageItem;

        img.removeEventListener(ImageItem.EVENT_IMG_FADED_OUT, this._onImgFadedOutFunc);
        this._container.removeChild(img.container);
    }
}