var ansi = require('ansi'),
	fs = require('fs'),
	path = require('path'),
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
			help: 'Test in this browser, e.g., "chrome" or "{ b: \'chrome\', v: \'32\' }" (can be repeated)',
			helpArg: 'NAME',
			type: 'arrayOfString'
		},
		{
			names: [ 'config', 'c' ],
			help: 'Intern config to use (e.g., "tests/intern")',
			type: 'string'
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
			names: [ 'proxy', 'p' ],
			help: 'Address:port that remote test runners should connect back to',
			helpArg: 'ADDRESS[:PORT]',
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
			names: [ 'server', 'e' ],
			help: 'Start Intern in "server" mode (only run the proxy, don\'t run tests)',
			type: 'bool'
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
			names: [ 'webdriver', 'w' ],
			help: 'Use WebDriver instead of the Node.js client',
			type: 'bool'
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

/**
 * Load and combine relevant internrc files
 */
function loadConfig() {
	function loadAndMerge(configPath) {
		var config = JSON.parse(fs.readFileSync(configPath));
		for (var key in config) {
			rc[key.replace('-', '_')] = config[key];
		}
	}

	if (rc) {
		return rc;
	}

	var project = findProjectRoot(),
		rcFile;

	rc = {};

	if (fs.existsSync(rcFile = path.join(getUserHome(), '.internrc'))) {
		loadAndMerge(rcFile);
	}

	if (project && fs.existsSync(rcFile = path.join(project, '.internrc'))) {
		loadAndMerge(rcFile);
	}

	rc.projectRoot = project;
	return rc;
}

/**
 * Return the user's home directory
 */
function getUserHome() {
	return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

/**
 * Locate project base directory (look for node_modules)
 */
function findProjectRoot() {
	var dir = process.cwd(),
		test;
	while (dir !== '/') {
		if (fs.existsSync(path.join(dir, 'node_modules'))) {
			return dir;
		}
		dir = path.normalize(path.join(dir, '..'));
	}
}

/**
 * Find Intern and return information about it
 */
exports.findIntern = function () {
	// first, see if this is a self-test
	var pkgFile = 'package.json',
		package;

	if (fs.existsSync(pkgFile)) {
		package = JSON.parse(fs.readFileSync(pkgFile));
		if (package.name === 'intern' || package.name === 'intern-geezer') {
			// selftest
			return {
				path: process.cwd(),
				package: package,
				isGeezer: package.name === 'intern-geezer'
			};
		}
	}
	
	var internDir = path.join(process.cwd(), 'node_modules', 'intern');
	if (!fs.existsSync(internDir)) {
		internDir = path.join(process.cwd(), 'node_modules', 'intern-geezer');
	}

	if (!fs.existsSync(internDir)) {
		return null;
	}

	package = JSON.parse(fs.readFileSync(path.join(internDir, 'package.json')));
	return {
		path: internDir,
		package: package,
		isGeezer: package.name === 'intern-geezer'
	};
};

/**
 * Merge static and command line configuration options
 */
exports.init = function () {
	var rc = loadConfig(),
		options = parseArgs();

	for (var option in options) {
		if (option === '_order') {
			continue;
		}
		rc[option] = options[option];
	}

	return rc;
};

/**
 * Get a help message string
 */
exports.help = function (subject) {
    var help = parser.help({ includeEnv: true }).trimRight();
    return 'usage: intern [OPTIONS] [ARG [ARG [...]]]\n' + 'options:\n' + help;
};

/**
 * Print a message and exit
 */
exports.die = function(message, code) {
	if (typeof code === 'undefined') {
		code = 0;
	}
	console.log(message);
	process.exit(code);
};

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
