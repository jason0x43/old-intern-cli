define({
	proxyPort: 9000,
	proxyUrl: 'http://localhost:9000/',
	useSauceConnect: false,
	webdriver: {
		host: 'localhost',
		port: 4444
	},
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [ { name: 'intern-cli', location: '.' } ]
	},
	suites: [ 'intern-cli/tests/all' ],
	functionalSuites: [],
	excludeInstrumentation: /^(?:tests|node_modules)\//
});
