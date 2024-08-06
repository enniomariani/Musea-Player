import {ControllerMain} from "renderer/controllers/ControllerMain.js";

document.addEventListener("DOMContentLoaded", async function () {
    const controllerMain:ControllerMain = new ControllerMain();
    await controllerMain.init();
});