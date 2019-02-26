const { app, BrowserWindow, Menu, ipcMain } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let modal

let contact

ipcMain.on('showEditModal', (event, arg, arg2) => {
  contact = arg
  index = arg2
  modal = new BrowserWindow({parent:win, modal:true, show:false, width:525, height:300, frame:false})
  modal.loadFile('editContact.html');
  modal.once('ready-to-show', () => {
    modal.show();
  })

})

ipcMain.on('pageDoneLoading', () => {
  modal.webContents.send('sendingContact', contact, index)
})


ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  //event.sender.send('asynchronous-reply', 'pong')
  if (arg === "refreshList"){
    loadAndDisplayContacts()
  }

  else if (arg == "showModal"){
    showAddContactModal();
  }
  else if (arg == "closeAndRefresh"){
    win.webContents.send('asynchronous-message', 'refreshList');
    modal.close();

  }
  else if (arg =="closeModal"){
    modal.close();
  }
})

//Allowing links to be opened from app.
ipcMain.on('new-window', function(e, url) {
  e.preventDefault();
  require('electron').shell.openExternal(url);
});



function showAddContactModal(){
  // create a dialog window for modal inputs
  modal = new BrowserWindow({parent:win, modal:true, show:false, width:525, height:300, frame:false})
  modal.loadFile('addContact.html');
  modal.once('ready-to-show', () => {
    modal.show();
  })
}


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 })


  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })


  const template = [
  {
      label: 'File',
      submenu: [
        { label: 'Import', click() { win.webContents.send('asynchronous-message', 'importFile');} },
        { label: 'Export', click() { win.webContents.send('asynchronous-message', 'exportFile');} }
      ]
  },
  {
    label: 'Tools',
    submenu: [
      { role: 'toggledevtools' }
    ]
  }
 ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
