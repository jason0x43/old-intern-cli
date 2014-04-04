/**
 * This module is loaded by the main cli script. It sets up the Intern runtime environment and kicks off the Intern
 * runner.
 */
define([ __cliConfig.config ], function (testConfig) {
	var options = __cliConfig.options,
		intern = __cliConfig.intern,
		runType = __cliConfig.runType;

	// 
	// Update the testConfig directly for options that pertain only to the runner
	//

	if ( options.no_instrument) {
		testConfig.excludeInstrumentation = /./;
	}

	if (options.remote) {
		var remote = options.remote.split(':');
		testConfig.webdriver.host = remote[0];
		if (remote.length > 1) {
			testConfig.webdriver.port = remote[1];
		}
	}

	if (options.proxy) {
		var proxy = options.proxy.split(':'),
			port = testConfig.proxyPort;
		if (proxy.length > 1) {
			port = Number(proxy[1]);
		}
		testConfig.proxyPort = Number(port);
		testConfig.proxyUrl = 'http://' + proxy[0] + ':' + port;
	}

	if (options.browser) {
		testConfig.environments = [];
		options.browser.forEach(function (name) {
			testConfig.environments.push({ browserName: name });
		});
	}

	testConfig.useSauceConnect = options.sauce;
	if (options.sauce_user) {
		testConfig.webdriver.username = options.sauce_user;
	}
	if (options.sauce_key) {
		testConfig.webdriver.accessKey = options.sauce_key;
	}

	//
	// Update the process arguments for options that pertain to the client
	//

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

	if (options.proxy_only) {
		process.argv.push('proxyOnly');
	}

	if (options.arg) {
		options.args.forEach(function (arg) {
			process.argv.push(arg);
		});
	}

	if (options.verbose) {
		console.log('Intern configuration:\n', testConfig);
	}

	if (options.verbose) {
		console.log('----------------------------------------------------------');
	}

	// start Intern
	require([ 'intern/' + runType ]);
});
