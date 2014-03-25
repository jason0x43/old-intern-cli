define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!../lib/cli'
], function (
	registerSuite,
	assert,
	cli
) {
	registerSuite({
		name: 'cli',

		'parseArgs': function () {
			args = cli.parseArgs();
			assert.deepEqual(args._args, [ 'tests/intern' ], 'Positional arguments should have expected value');
		},

		'help': function () {
			var oldClog = console.log;
			console.log = function () {
				assert.match(arguments[0], /usage: intern.*/, 'Help message should start with expected preamble');
			};
			cli.help();
			console.log = oldClog;
		}
	});
});
