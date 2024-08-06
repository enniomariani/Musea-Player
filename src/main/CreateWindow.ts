import {BrowserWindow} from "electron";

export class CreateWindow{
    private _win:BrowserWindow;

    private _onShowWindowFunc: ()=> void = this._onShowWindow.bind(this);
    private _onDOMReadyFunc: ()=> void = this._onDOMReady.bind(this);
    private _onBlurFunc: ()=> void = this._onBlur.bind(this);

    private _disableMouseCursor:boolean;
    private _rotateContent180Degrees:boolean;
    private _isFullScreen:boolean;

    constructor(windowWidth:number, windowHeight:number, isFullScreen:boolean, pathToPreload:string, disableMouseCursor:boolean, rotateContent180:boolean) {
        this._win = new BrowserWindow({
            width: windowWidth, height: windowHeight, kiosk: isFullScreen, //hides the menubar when fullscreen is set to true in the settings-file
            autoHideMenuBar: isFullScreen, fullscreen: isFullScreen, webPreferences: {
                nodeIntegration: false, contextIsolation: true,
                preload: pathToPreload
            }
        });

        this._disableMouseCursor = disableMouseCursor;
        this._rotateContent180Degrees = rotateContent180;
        this._isFullScreen = isFullScreen;
    }

    async create(pathToIndexHtml:string):Promise<BrowserWindow> {
        console.log("create window with path to index.html: ", pathToIndexHtml)

        // Make the window appear always on top, if fullscreen is chosen
        if (this._isFullScreen) {
            this._win.on('blur', this._onBlurFunc);
            this._win.setAlwaysOnTop(true, "screen-saver");
        }

        this._win.webContents.on('dom-ready', this._onDOMReadyFunc);

        return this._win;
    }

    close(){
        this._win.off('blur', this._onBlurFunc);
        this._win.off('show', this._onShowWindowFunc);
    }

    private _onBlur(){
        this._win.focus();
    }

    private _onDOMReady(){
        let css:string;

        this._win.webContents.off('dom-ready', this._onDOMReadyFunc);

        //if the mouse-pointer is disabled in the settings-file, hide it in every css-object
        if (this._disableMouseCursor){
            css = '* { cursor: none !important; }';
            this._win.webContents.insertCSS(css);
        }

        if(this._rotateContent180Degrees){
            css = '#content {' +
                'transform-origin: center;' + // Centering the rotation
                'transform: rotate(180deg);' +
                'overflow: auto;' +
                '}';
            this._win.webContents.insertCSS(css);
        }
    }

    private _onShowWindow(){
        this._win.focus();
    }
}