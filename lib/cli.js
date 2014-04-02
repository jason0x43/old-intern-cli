var ansi = require('ansi'),
	fs = require('fs'),
	path = require('path'),
	resolve = require('resolve').sync,
	stdout = ansi(process.stdout),
	stderr = ansi(process.stderr),
	dashdash = require('dashdash'),
	options = [
		{
			names: [ 'version', 'V' ],
			help: 'Show the version number and exit',
			type: 'bool'
		},
		{
			names: [ 'browser', 'b' ],
			help: 'Use this browser (e.g., "chrome") when testing locally (can be repeated)',
			helpArg: 'NAME',
			type: 'arrayOfString'
		},
		{
			names: [ 'client', 'c' ],
			help: 'Use Node.js client instead of WebDriver',
			type: 'bool'
		},
		{
			names: [ 'help', 'h' ],
			help: 'Show a help message and exit',
			type: 'bool'
		},
		{
			names: [ 'no-instrument', 'I' ],
			help: 'Disable instrumentation',
			type: 'bool'
		},
		{
			names: [ 'keep-remote', 'k' ],
			help: 'Do not close remote after tests are finished',
			type: 'bool'
		},
		{
			names: [ 'proxy-only', 'o' ],
			help: 'Start Intern in "proxy only" mode (don\'t run tests)',
			type: 'bool'
		},
		{
			names: [ 'proxy', 'p' ],
			help: 'Address:port of the test proxy server (that a remote system should connect back to)',
			type: 'string'
		},
		{
			names: [ 'remote', 'r' ],
			help: 'Address:port of remote host to use for WebDriver tests',
			helpArg: 'ADDRESS[:PORT]',
			type: 'string'
		},
		{
			names: [ 'reporter', 'R' ],
			help: 'Specify a reporter to use (can be repeated)',
			helpArg: 'NAME',
			type: 'arrayOfString'
		},
		{
			names: [ 'suite', 's' ],
			help: 'A specific suite to test (can be repeated)',
			helpArg: 'NAME',
			type: 'arrayOfString'
		},
		{
			names: [ 'sauce', 'S' ],
			help: 'Use Sauce Labs to run tests',
			type: 'bool',
			default: false
		},
		{
			names: [ 'sauce-user' ],
			help: 'Sauce Labs user name',
			env: 'SAUCE_USERNAME',
			type: 'string'
		},
		{
			names: [ 'sauce-key' ],
			help: 'Sauce Labs API key',
			env: 'SAUCE_ACCESS_KEY',
			type: 'string'
		},
		{
			names: [ 'verbose', 'v' ],
			help: 'Be more verbose; show debugging messages',
			type: 'bool'
		},
		{
			names: [ 'no-color', 'C' ],
			help: 'Disable terminal color support',
			type: 'bool'
		}
	],
	parser = dashdash.createParser({ options: options }),
	originalConsole,
	args,
	rc;

/**
 * Parse command line arguments and return options object.
 */
function parseArgs () {
	if (!args) {
		args = parser.parse({ options: options });
	}
	return args;
}
exports.parseArgs = parseArgs;

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
function loadConfig() {
	if (rc) {
		return rc;
	}

	var project = findProjectRoot(),
		homeRc = path.join(getUserHome(), '.internrc'),
		projectRc;

	rc = fs.existsSync(homeRc) ? JSON.parse(fs.readFileSync(homeRc)) : {};

	if (project && fs.existsSync(projectRc = path.join(project, '.internrc'))) {
		var projectConfig = JSON.parse(fs.readFileSync(projectRc));
		for (var key in projectConfig) {
			rc[key.replace('-', '_')] = projectConfig[key];
		}
	}

	rc.projectRoot = project;
	return rc;
}
exports.loadConfig = loadConfig;

/**
 * Merge static and command line configuration options
 */
exports.init = function () {
	var rc = loadConfig(),
		options = parseArgs();

	if (rc.projectRoot) {
		process.chdir(rc.projectRoot);
	}

	for (var option in options) {
		if (option === '_args' || option === '_order') {
			continue;
		}
		rc[option] = options[option];
	}

	if (options._args.length > 0) {
		rc.config = options._args[0];
	}

	return rc;
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
    return 'usage: intern CONFIG [OPTIONS]\n' + 'options:\n' + help;
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
