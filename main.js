const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

let mainWindow
let aboutWindow

// Main Window
function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: 'Image Resizer',
		width: isDev ? 1000 : 500,
		icon: `${__dirname}/assets/icons/Icon_256x256.png`,
		resizable: isDev,
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
		height: 300,
		title: 'About Electron',
		icon: `${__dirname}/assets/icons/Icon_256x256.png`,
	})

	aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}

// When the app is ready, create the window
app.on('ready', () => {
	createMainWindow()

	// Implement Menu
	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)

	// Remove mainWindow when close
	mainWindow.on('closed', () => (mainWindow = null))


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
	}]
		: []),
]

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
	options.dest = path.join(os.homedir(), 'imageresizer')
	resizeImage(options)
})

// Resize the image
async function resizeImage({ imgPath, width, height, dest }) {
	try {
		const newPath = await resizeImg(fs.readFileSync(imgPath), {
			width: +width,
			height: +height
		})

		// Create filename
		const filename = path.basename(imgPath)

		// Create dest folder if not exists
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest)
		}

		// Write file to dest
		fs.writeFileSync(path.join(dest, filename), newPath)

		// Send success to render
		mainWindow.webContents.send('image:done')

		// Open dest folder
		shell.openPath(dest)

	} catch (error) {
		console.log(error)
	}
}

// Quit when all windows are closed
app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit()
	}
})

// Open a window if none are open(macOS)
app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow()
	}
})