const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

// Main Window
function createMainWindow() {
	const mainWindow = new BrowserWindow({
		title: 'Image Resizer',
		width: isDev ? 1000 : 500,
		height: 600
	})

	// Show devtools automatically if in development
	if (isDev) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

// When the app is ready, create the window
app.whenReady().then(() => {
	createMainWindow()

	// Implement Menu
	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)
})




// Menu template
const menu = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Quit',
				click: () => app.quit(),
				accelerator: 'CmdOrCtrl+W'
			}
		]
	}
]

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit()
	}
})