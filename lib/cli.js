var ansi = require('ansi'),
	stdout = ansi(process.stdout),
	stderr = ansi(process.stderr);

var dashdash = require('dashdash'),
	options = [
		{
			names: [ 'help', 'h' ],
			version: 'Show a help message and exit',
			type: 'bool'
		},
		{
			names: [ 'version', 'V' ],
			version: 'Show the version number and exit',
			type: 'bool'
		},
		{
			names: [ 'uninstrument', 'u' ],
			help: 'Disable instrumentation',
			type: 'bool'
		},
		{
			names: [ 'keep', 'k' ],
			help: 'Keep browser open after tests',
			type: 'bool'
		},
		{
			names: [ 'client', 'c' ],
			help: 'Use Node.js test client',
			type: 'bool'
		},
		{
			names: [ 'proxy', 'p' ],
			help: 'Only run the proxy server (no tests)',
			type: 'bool'
		},
		{
			names: [ 'local', 'l' ],
			help: 'Local testing (not Sauce)',
			type: 'bool'
		},
		{
			names: [ 'suite', 's' ],
			help: 'A specific suite to test',
			type: 'arrayOfString'
		},
		{
			names: [ 'selftest', 't' ],
			help: 'Selftest intern',
			type: 'bool'
		}
	],
	parser = dashdash.createParser({ options: options }),
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

exports.help = function (subject) {
    var help = parser.help({ includeEnv: true }).trimRight();
    console.log('usage: intern [OPTIONS]\n' + 'options:\n' + help);
};

exports.die = function (message, code) {
	console.error(message);
	process.exit(code);
};

exports.run = function (options, selfTest) {
	var runType = options.client ? 'client' : 'runner',
		req = require('intern/node_modules/dojo/dojo'),
		config = options._args[0];

	// clear and reset process.argv[2:] -- the only option we want is the config, everything else will be
	// modified in the config object directly
	process.argv = process.argv.slice(0, 2);
	process.argv.push('config=' + config);

	req([ config ], function (testConfig) {
		if (options.uninstrument) {
			// directly update the test config for instrumentation since the runner handles instrumentation
			testConfig.excludeInstrumentation = /./;
		}

		if (options.suite) {
			// suites have to be pushed onto argv because the remote doesn't share the same config object as the runner
			for (var i = 0; i < options.suite.length; i++) {
				process.argv.push('suites=' + options.suite[i]);
			}
		}

		if (options.local) {
			testConfig.useSauceConnect = false;
		}

		if (options.keep) {
			process.argv.push('leaveRemoteOpen');
		}

		if (options.proxy) {
			process.argv.push('proxyOnly');
		}

		var internPath = process.cwd();
		if (!options.selftest) {
			internPath += '/node_modules/intern';
		}

		// configure the loader (normally handled by Intern's runner and client)
		global.__internConfig = {
			baseUrl: process.cwd(),
			packages: [
				{ name: 'intern', location: internPath }
			],
			map: {
				intern: {
					dojo: 'intern/node_modules/dojo',
					chai: 'intern/node_modules/chai/chai'
				},
				'*': {
					'intern/dojo': 'intern/node_modules/dojo'
				}
			}
		};

		var consoleLog = console.log,
			consoleError = console.error,
			consoleInfo = console.info,
			consoleWarn = console.warn;

		console.log = function () {
			consoleLog.apply(null, arguments);
		};
		console.info = function () {
			stdout.green();
			consoleInfo.apply(null, arguments);
			stdout.reset();
		};
		console.error = function () {
			stderr.red();
			consoleError.apply(null, arguments);
			stderr.reset();
		};
		console.warn = function () {
			stderr.yellow();
			consoleWarn.apply(null, arguments);
			stderr.reset();
		};

		// start Intern
		req(global.__internConfig, [ 'intern/' + runType ]);
	});
};
