import {GlobalSetting} from "main/globalSettings/GlobalSetting.js";

export class GlobalSettingsFactory{

    //names of global settings
    static IS_FULLSCREEN:string = "isFullScreen";
    static MOUSE_ENABLED:string = "mouseEnabled";
    static DMX_COM_PORT:string = "dmxComPort";
    static BG_IMG_NAME:string = "bgImageName";
    static ROTATE_CONTENT_180_DEGREES:string = "rotateContent180Degrees";

    constructor() {}

    /**
     * creates an array of GlobalSetting-objects
     * @returns {GlobalSetting[]}
     */
    static getGlobalSettings(){
        let settings = [];
        settings.push(new GlobalSetting("Vollbild", GlobalSettingsFactory.IS_FULLSCREEN, GlobalSetting.TYPE_BOOLEAN, true));
        settings.push(new GlobalSetting("Mauszeiger", GlobalSettingsFactory.MOUSE_ENABLED, GlobalSetting.TYPE_BOOLEAN, false));
        settings.push(new GlobalSetting("COMPortDMXLicht", GlobalSettingsFactory.DMX_COM_PORT, GlobalSetting.TYPE_STRING, ""));
        settings.push(new GlobalSetting("PfadZumHintergrundBild", GlobalSettingsFactory.BG_IMG_NAME, GlobalSetting.TYPE_STRING, ""));
        settings.push(new GlobalSetting("InhaltRotieren180Grad", GlobalSettingsFactory.ROTATE_CONTENT_180_DEGREES, GlobalSetting.TYPE_BOOLEAN, false));

        return settings
    }
}