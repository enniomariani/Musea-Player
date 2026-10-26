import {ControllerMain} from "renderer/controllers/ControllerMain.js";
import {loadTheme} from "./Theme.js";

document.addEventListener("DOMContentLoaded", async function () {

    await loadTheme(window.backend);

    const controllerMain:ControllerMain = new ControllerMain();
    await controllerMain.init();
});