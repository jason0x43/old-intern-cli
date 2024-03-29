/**
 * This module is loaded by the main cli script. It sets up the Intern runtime environment and kicks off the Intern
 * runner.
 */
define([ __cliConfig.config ], function (testConfig) {
	var options = __cliConfig.options;
	var intern = __cliConfig.intern;
	var runType = (options.webdriver || options.sauce || options.browser || intern.isGeezer) ? 'runner' : 'client';

	// 
	// Update the testConfig directly for options that pertain only to the runner
	//

	if (options.no_instrument) {
		testConfig.excludeInstrumentation = /./;
	}

	if (options.proxy) {
		var address = options.proxy.split(':');
		var port = testConfig.proxyPort;
		if (address.length > 1) {
			port = Number(address[1]);
		}
		testConfig.proxyPort = Number(port);
		testConfig.proxyUrl = 'http://' + address[0] + ':' + port;
	}

	if (options.browser) {
		testConfig.environments = [];
		options.browser.forEach(function (name) {
			var env = name.indexOf('{') !== -1 ? JSON.parse(name) : { browserName: name };
			testConfig.environments.push(env);
		});
	}

	if (testConfig.webdriver) {
		testConfig.useSauceConnect = options.sauce;

		if (options.sauce_user) {
			testConfig.webdriver.username = options.sauce_user;
		}
		if (options.sauce_key) {
			testConfig.webdriver.accessKey = options.sauce_key;
		}

		// remote is ignored when Sauce is enabled
		if (options.remote && !options.sauce) {
			var remote = options.remote.split(':');
			testConfig.webdriver.host = remote[0];
			if (remote.length > 1) {
				testConfig.webdriver.port = remote[1];
			}
		}
	}

	//
	// Update the process arguments for options that pertain to the client
	//

	if (options.list) {
		process.argv = process.argv.concat('listTests');
	}

	if (options.grep) {
		process.argv = process.argv.concat('grep=' + options.grep);
	}

	if (options.suite) {
		options.suite.forEach(function (suite) {
			suite = options.suiteBase ? options.suiteBase + '/' + suite : suite;
			process.argv.push('suites=' + suite);
		});
	}

	if (options.reporter) {
		options.reporter.forEach(function (name) {
			process.argv.push('reporters=' + name);
		});
	}

	if (options.keep_remote) {
		process.argv.push('leaveRemoteOpen');
	}

	if (options.server) {
		process.argv.push('proxyOnly');
	}

	if (options.arg) {
		options.args.forEach(function (arg) {
			process.argv.push(arg);
		});
	}

	if (options.verbose) {
		console.log('Intern configuration:\n', testConfig, '\n');
		console.log('Arguments:\n', process.argv, '\n');
	}

	if (options.verbose) {
		console.log('----------------------------------------------------------');
	}

	// start Intern
	require([ 'intern/' + runType ]);
});
