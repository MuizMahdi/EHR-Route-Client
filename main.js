'use strict';

const { app, BrowserWindow, ipcMain } = require("electron");
const { download } = require("electron-dl");
// require('electron-reload')(__dirname);

const path = require("path");
const url = require("url");
const fs = require("fs");


// Window object
let appWindow; 


// Create window on electron initialization
app.on("ready", function() {
   initializeAppPaths();
   createWindow();
});


// Initialize window and its properties on startup
app.on("activate", function() {

   if (appWindow === null) {
      createWindow();
   }

});


// Quit when all windows are closed
app.on("window-all-closed", function () {

   if (process.platform !== 'darwin') {
      app.quit()
   }

});


async function createWindow()
{
   // Application window properties
   appWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      icon: "https://image.flaticon.com/icons/svg/149/149054.svg" 
   });


   appWindow.maximize();

   // [Dev only] get dynamic version from localhost:4200.
   require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
   });
   
   appWindow.loadURL('http://localhost:4200');


/*
   // load the index.html from the dist folder of Angular
   appWindow.loadURL(
      url.format({
         pathname: path.join(__dirname, '/dist/index.html'),
         protocol: 'file:',
         slashes: true
      })
   );
*/

   // Enable and open Chrome DevTools
   appWindow.webContents.openDevTools();


   // [Dev only] Disable menu 
   appWindow.setMenu(null);


   // On window closing set appWindow to null
   appWindow.on("closed", function() {
      appWindow = null
   });


   // On file download requests
   ipcMain.on("download", (event, info) => {

      const appWindow = BrowserWindow.getFocusedWindow();

      download(appWindow, info.url, info.properties).then(dl => {
         event.sender.send('DownloadComplete', dl.getSavePath());
      });
      
   });
}


async function initializeAppPaths()
{
   let userDataPath = app.getPath('userData');
   
   // Check if user data path exists
   fs.exists(userDataPath, (exists) => {

      // If not then create the directory
      if (!exists) fs.mkdir(userDataPath, (error) => {
         console.log(error);
      });

   });
   
   // For windows OS
   if (process.platform === 'win32') {
      
      // Get the app's ProgramData path
      let appDataPath = path.resolve(process.env.ProgramData || 'C:\\ProgramData', app.getName());
      
      // Check if it exists
      fs.exists(appDataPath, (exists) => {

         // If not then create the directory
         if (!exists) fs.mkdir(appDataPath, (error) => {
            console.log(error);
         });

      });

   }
}
