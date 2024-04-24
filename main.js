// modules
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

const resizeImg = require("resize-img");

const isDev = process.env.NODE_ENV !== "production";

let mainWindow;
//creating the main windows
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Image-resize",
    width: isDev ? 800 : 800,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //if dev , open the dev tools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Load HTML file
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

//About the Window
function createAboutWindow() {
  let aboutWindow = new BrowserWindow({
    title: "IAbout mage-resize",
    width: 300,
    height: 300,
  });

  // Load HTML file
  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// App is on ready
app.whenReady().then(() => {
  console.log("App.ready triggered");
  createWindow();

  //Implement the Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //remove the mainwindow from the memory when close
  mainWindow.on("closed", () => mainWindow == null);
});

///respond to IPCREnderer resize
ipcMain.on("image:resize", (e, options) => {
  console.log(options);
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

//resizing the Image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    //create a new file name
    const fileName = path.basename(imgPath);
    //create anew Folder if not there
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //write file to Dest
    fs.writeFileSync(path.join(dest, fileName), newPath);

    //send success to the renderer
    mainWindow.webContents.send("image-done");

    //open destination folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Activate app on macOS when dock icon clicked and no windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//Menu Template
const menu = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CmdOrCtrl+W",
      },
      {
        label: "Help",
        submenu: [
          {
            label: "About",
            click: createAboutWindow,
          },
        ],
      },
    ],
  },
];
