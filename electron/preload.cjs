const { contextBridge } = require('electron');

// Lets the UI know it runs as the desktop app (for example to show shortcut hints).
contextBridge.exposeInMainWorld('desktop', { platform: process.platform });
