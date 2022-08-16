const { app, BrowserWindow, session } = require('electron');
const { default: installExtension, REACT_DEVELOPER_TOOLS, REACT_PERF, MOBX_DEVTOOLS } = require('electron-devtools-installer');

class AppWindow extends BrowserWindow {
  constructor(config, urlLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: true,
        nodeIntegrationInWorker: true,
      },
      show: false,
      backgroundColor: '#efefef',
      frame: false,
    };
    const finalConfig = { ...basicConfig, ...config };
    super(finalConfig);
    this.loadURL(urlLocation);
    this.once('ready-to-show', () => {
      this.show();
    });
  }
}
app.on('ready', () => {
  installExtension(REACT_DEVELOPER_TOOLS, REACT_PERF, MOBX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
  const mainWindowConfig = {
    width: 1440,
    height: 768,
  };
  const urlLocation = 'http://localhost:5173';
  const mainWindow = new AppWindow(mainWindowConfig, urlLocation);
  const ses = mainWindow.webContents.session;
  ses.cookies.get({}).then((cookie) => {
    console.log(cookie, 999);
  })
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
});
