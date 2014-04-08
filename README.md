# intern-cli

Tired of typing `node node_modules/intern/.bin/runner`? Wish Intern's command line arguments were a bit more concise? Want to change an option without rewriting a config file? Try intern-cli.

## Features

* Start Intern from anywhere in a project tree
* Easily disable instrumentation
* Test locally by default

## Installation

`npm install -g https://github.com/jason0x43/intern-cli/tarball/master`

## Usage

```
usage: intern [OPTIONS] [ARG [ARG [...]]]
options:
    -V, --version                       Show the version number and exit
    -b NAME, --browser=NAME             Use this browser (e.g., "chrome") when
                                        testing locally (can be repeated)
    -c ARG, --config=ARG                Intern config to use (e.g.,
                                        "tests/intern")
    -h, --help                          Show a help message and exit
    -I, --no-instrument                 Disable instrumentation
    -k, --keep-remote                   Do not close remote after tests are
                                        finished
    -o, --proxy-only                    Start Intern in "proxy only" mode (don't
                                        run tests)
    -p ARG, --proxy=ARG                 Address:port of the test proxy server
                                        (that a remote system should connect
                                        back to)
    -r ADDRESS[:PORT], --remote=ADDRESS[:PORT]
                                        Address:port of remote host to use for
                                        WebDriver tests
    -R NAME, --reporter=NAME            Specify a reporter to use (can be
                                        repeated)
    -s NAME, --suite=NAME               A specific suite to test (can be
                                        repeated)
    -S, --sauce                         Use Sauce Labs to run tests
    --sauce-user=ARG                    Sauce Labs user name. Environment:
                                        SAUCE_USERNAME=ARG
    --sauce-key=ARG                     Sauce Labs API key. Environment:
                                        SAUCE_ACCESS_KEY=ARG
    -w, --webdriver                     Use WebDriver instead of the Node.js
                                        client
    -v, --verbose                       Be more verbose; show debugging messages
    -C, --no-color                      Disable terminal color support
```

* Run intern:

`intern tests/intern`

* Run tests in a browser

`intern tests/intern -s app/tests/foo -w`

* Run a particular suite

`intern tests/intern -s app/tests/foo`

## Configuration

You can store default values for options in a JSON-formatted `.internrc` files in your project root directory and in your home directory. In addition to the long options above, this file may also contain `config` and `suiteBase` options. For example:

```
{
    "config": "tests/intern",
	"suiteBase": "myapp/tests"
}
```

### config

`config` is your default Intern config. You can still override it by providing a config on the command line.

### suiteBase

`suiteBase` is the base module path for your tests. For example, if your test suites were all under the `myapp/foo` base module identifier, you could could set `suiteBase` to `myapp/foo` and then just use the rest of a suite module ID on the command line. So you could use

`intern -s foo`

instead of

`intern -s myapp/tests/foo`
