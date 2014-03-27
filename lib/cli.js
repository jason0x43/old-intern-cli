var ansi = require('ansi'),
	fs = require('fs'),
	path = require('path'),
	resolve = require('resolve').sync,
	stdout = ansi(process.stdout),
	stderr = ansi(process.stderr);

var dashdash = require('dashdash'),
	options = [
		{
			names: [ 'version', 'V' ],
			help: 'Show the version number and exit',
			type: 'bool'
		},
		{
			names: [ 'client', 'c' ],
			help: 'Use Node.js test client instead of WebDriver',
			type: 'bool'
		},
		{
			names: [ 'help', 'h' ],
			help: 'Show a help message and exit',
			type: 'bool'
		},
		{
			names: [ 'keep-remote', 'k' ],
			help: 'Keep remote open after tests',
			type: 'bool'
		},
		{
			names: [ 'local', 'l' ],
			help: 'Local WebDriver testing',
			type: 'bool'
		},
		{
			names: [ 'proxy', 'p' ],
			help: 'Only start the instrumenting proxy server (no tests)',
			type: 'bool'
		},
		{
			names: [ 'suite', 's' ],
			help: 'A specific suite to test (can be repeated)',
			type: 'arrayOfString'
		},
		{
			names: [ 'uninstrument', 'u' ],
			help: 'Disable instrumentation',
			type: 'bool'
		},
		{
			names: [ 'verbose', 'v' ],
			help: 'Be more verbose; show debugging messages',
			type: 'bool'
		},
		{
			names: [ 'no-color' ],
			help: 'Disable terminal color support',
			type: 'bool'
		}
	],
	parser = dashdash.createParser({ options: options }),
	originalConsole,
	args;

/**
 * Parse command line arguments and return options object.
 */
exports.parseArgs = function () {
	if (!args) {
		args = parser.parse({ options: options });
	}
	return args;
};

/**
 * Load the intern package.json file
 */
exports.loadInternPackage = function () {
	// make sure a local intern install is present
	try {
		var internDir = path.dirname(resolve('intern', { basedir: process.cwd() })),
			pkgFile = path.join(internDir, 'package.json');
		return {
			path: internDir,
			package: JSON.parse(fs.readFileSync(pkgFile))
		};
	} catch (e) {}
};

/**
 * Load and combine relevant internrc files
 */
exports.loadConfig = function () {
	var project = findProjectRoot(),
		homeRc = path.join(getUserHome(), '.internrc'),
		projectRc,
		config = { projectRoot: project };

	if (fs.existsSync(homeRc)) {
		config = JSON.parse(fs.readFileSync(homeRc));
	}

	if (project && fs.existsSync(projectRc = path.join(project, '.internrc'))) {
		var projectConfig = JSON.parse(fs.readFileSync(projectRc));
		for (var key in projectConfig) {
			config[key] = projectConfig[key];
		}
	}

	return config;
};

/**
 * Return the user's home directory
 */
function getUserHome() {
	return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}
exports.getUserHome = getUserHome;

/**
 * Locate project base directory (assuming git-based project)
 */
function findProjectRoot() {
	var dir = process.cwd(),
		test;
	while (dir !== '/') {
		if (fs.existsSync(path.join(dir, '.git'))) {
			return dir;
		}
		dir = path.normalize(path.join(dir, '..'));
	}
}
exports.findProjectRoot = findProjectRoot();

/**
 * Get a help message string
 */
exports.help = function (subject) {
    var help = parser.help({ includeEnv: true }).trimRight();
    return 'usage: intern [OPTIONS]\n' + 'options:\n' + help;
};

/**
 * Print a message and exit
 */
function die(message, code) {
	if (typeof code === 'undefined') {
		code = 0;
	}
	console.log(message);
	process.exit(code);
}
exports.die = die;

/**
 * Add color support to the console
 */
exports.colorizeConsole = function (options) {
	if (originalConsole) {
		return;
	}

	options = options || {};

	originalConsole = {
		log: console.log,
		error: console.error,
		info: console.info,
		warn: console.warn,
		trace: console.trace,
		debug: console.debug
	};

	console.info = function () {
		stdout.green();
		originalConsole.info.apply(null, arguments);
		stdout.reset();
	};

	console.log = function () {
		originalConsole.log.apply(null, arguments);
	};

	if (!options.debug) {
		console.debug = function () {};
	}
	else {
		console.debug = function () {
			stdout.hex('#333333');
			originalConsole.log.apply(null, arguments);
			stdout.green();
		};
	}

	console.trace = function () {
		originalConsole.trace.apply(null, arguments);
	};

	console.error = function () {
		stderr.red();
		originalConsole.error.apply(null, arguments);
		stderr.reset();
	};

	console.warn = function () {
		stderr.yellow();
		originalConsole.warn.apply(null, arguments);
		stderr.reset();
	};
};
