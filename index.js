'use strict';
const path = require('path');
const remote = require('@electron/remote');
const Conf = require('conf');

let isInitialized = false;

// Set up the `ipcMain` handler for communication between renderer and main process.
const initDataListener = () => {
	if (!remote.app || !remote.remote.app) {
		throw new Error('Electron Store: You need to call `.initRenderer()` from the main process.');
	}

	const appData = {
		defaultCwd: (remote.app || remote.remote.app).getPath('userData'),
		appVersion: (remote.app || remote.remote.app).getVersion()
	};

	if (isInitialized) {
		return appData;
	}

	isInitialized = true;

	return appData;
};

class ElectronStore extends Conf {
	constructor(options) {
		let defaultCwd;
		let appVersion;

		// If we are in the renderer process, we communicate with the main process
		// to get the required data for the module otherwise, we pull from the main process.
		({defaultCwd, appVersion} = initDataListener());

		options = {
			name: 'config',
			...options
		};

		if (!options.projectVersion) {
			options.projectVersion = appVersion;
		}

		if (options.cwd) {
			options.cwd = path.isAbsolute(options.cwd) ? options.cwd : path.join(defaultCwd, options.cwd);
		} else {
			options.cwd = defaultCwd;
		}

		options.configName = options.name;
		delete options.name;

		super(options);
	}

	static initRenderer() {
		initDataListener();
	}
}

module.exports = ElectronStore;
