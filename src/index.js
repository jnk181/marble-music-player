const { app, BrowserWindow,ipcMain } = require('electron');
const path = require('node:path');
const os = require('os');
var fs = require('fs');

app.setAppUserModelId('com.jnk181.marble-music-player');

function mkdirp(dir) {
  if (fs.existsSync(dir)) { return true }
  const dirname = path.dirname(dir)
  mkdirp(dirname);
  fs.mkdirSync(dir);
}

function touchFile(file_path) {
    try {
        fs.openSync(`${file_path}`, 'wx');
    } catch (error) {
      
    }
}

function initLocalDirectories() {
    mkdirp(`/home/${os.userInfo().username}/.local/share/marble_mp`);
    mkdirp(`/home/${os.userInfo().username}/.local/share/marble_mp/css`);
    mkdirp(`/home/${os.userInfo().username}/.local/share/marble_mp/img`);
    mkdirp(`/home/${os.userInfo().username}/.local/share/marble_mp/img/discs`);
    mkdirp(`/home/${os.userInfo().username}/.local/share/marble_mp/thumbs`);
    mkdirp(`/home/${os.userInfo().username}/.local/share/marble_mp/waveforms`);
    touchFile(`/home/${os.userInfo().username}/.local/share/marble_mp/css/custom.css`);
    touchFile(`/home/${os.userInfo().username}/.local/share/marble_mp/css/paste_at_root.css`);
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  initLocalDirectories();

  //mainWindow.setMenu(null)

  // and load the index.html of the app.
  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

function handleStartupArgs() {
  const args = process.argv;

  const playAlbumIndex = args.indexOf('--playalbum');

  if (playAlbumIndex !== -1 && args.length >= playAlbumIndex + 3) {
    const artist = args[playAlbumIndex + 1];
    const album = args[playAlbumIndex + 2];


    //console.log(`Command received: Play ${album} by ${artist}`);

    mainWindow.webContents.send('play-album-trigger', { artist, album });
  }
}

ipcMain.handle('get-app-args', () => {
  // If packaged, args start at index 1. If in dev mode, they usually start at index 2.
  const offset = app.isPackaged ? 1 : 2;
  //console.log(process.argv.slice(offset))
  return process.argv.slice(offset);
});

app.whenReady().then(() => {
  createWindow();
  handleStartupArgs();

  const glob = require("glob");
  var getDirectories = function (src, callback) {
    glob(src + '/**/*.(mp3)', callback);
  };

  var sqlite3 = require('sqlite3').verbose();

  //console.log("hello")

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
