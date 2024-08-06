import {app, BrowserWindow} from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';

import {CreateWindow} from "main/CreateWindow.js";
import {GlobalSettingsFactory} from "main/globalSettings/GlobalSettingsFactory.js";
import {InitSettings} from "main/globalSettings/InitSettings.js";
import { MuseaServerMain } from "musea-server/main";

/**
 * the main.ts is loaded by electron and has access to file-system, etc.
 * if a BrowserWindow is created, HTML and js can be loaded in the window (for example the renderer.ts)
 *
 */

//size of main-window
const windowWidth:number = 1920;
const windowHeight:number = 1080;

const filename:string = fileURLToPath(import.meta.url);
const __dirname:string = dirname(filename);

//the NODE_ENV-variable is set before starting the app to "development", if the app is running on
//the development-system
const environment:string | undefined = process.env.NODE_ENV;

let allSettingsByName = null;
let initSettings:InitSettings = new InitSettings();

let mainWindow:BrowserWindow | null = null;
let museaServerMain:MuseaServerMain;

const pathToDataFolder:string = environment === 'development' ? join(__dirname, '..', 'daten\\') :
    join(process.resourcesPath, '\\daten\\');

app.whenReady().then(async ():Promise<void> => {
    allSettingsByName = initSettings.init(pathToDataFolder);

    const createWindow:CreateWindow = new CreateWindow(windowWidth, windowHeight,
        allSettingsByName[GlobalSettingsFactory.IS_FULLSCREEN], join(__dirname, '../preload/preload.js'),
        !allSettingsByName[GlobalSettingsFactory.MOUSE_ENABLED],
        allSettingsByName[GlobalSettingsFactory.ROTATE_CONTENT_180_DEGREES]);

    mainWindow = await createWindow.create(join(__dirname, '../index.html'));

    museaServerMain = new MuseaServerMain(pathToDataFolder, mainWindow);
    await museaServerMain.init(allSettingsByName[GlobalSettingsFactory.DMX_COM_PORT] === ""?null: allSettingsByName[GlobalSettingsFactory.DMX_COM_PORT]);

    await mainWindow.loadFile(join(__dirname, '../index.html'));

    if(environment === 'development')
        mainWindow.webContents.openDevTools();

    mainWindow.show(); //initially sets the focus to the created electron-window

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            createWindow.close();
            app.quit();
        }
    });
});