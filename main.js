const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

// Main Window
function createMainWindow() {
	const mainWindow = new BrowserWindow({
		title: 'Image Resizer',
		width: isDev ? 1000 : 500,
		height: 600,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: true,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// Show devtools automatically if in development
	if (isDev) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

// About window
function createAboutWindow() {
	const aboutWindow = new BrowserWindow({
		title: 'About Image Resizer',
		width: 300,
		height: 300
	})

	aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
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
	...(isMac ? [{
		label: app.name,
		submenu: [
			{
				label: 'About',
				click: createAboutWindow
			}
		]
	}] : []),
	{
		role: 'fileMenu'
	},
	...(!isMac ? [{
		label: 'Help',
		submenu: [{
			label: 'About',
			click: createAboutWindow
		}]
	}] : []),
]

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit()
	}
})