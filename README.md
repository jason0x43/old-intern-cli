# intern-cli

An enhanced command line front-end for Intern

## Features

* Start Intern from anywhere in a project tree
* Access all intern options from the command line
* Test locally by default
* Colorized output

## Installation

`npm install -g https://github.com/jason0x43/intern-cli/tarball/master`

## Usage

```
usage: intern [OPTIONS] [ARG [ARG [...]]]
options:
    -V, --version                       Show the version number and exit
    -b NAME, --browser=NAME             Test in this browser, e.g., "chrome" or
                                        "{ b: 'chrome', v: '32' }" (can be
                                        repeated)
    -c ARG, --config=ARG                Intern config to use (e.g.,
                                        "tests/intern")
    -h, --help                          Show a help message and exit
    -I, --no-instrument                 Disable instrumentation
    -k, --keep-remote                   Do not close remote after tests are
                                        finished
    -p ADDRESS[:PORT], --proxy=ADDRESS[:PORT]
                                        Address:port that remote test runners
                                        should connect back to
    -r ADDRESS[:PORT], --remote=ADDRESS[:PORT]
                                        Address:port of remote host to use for
                                        WebDriver tests
    -R NAME, --reporter=NAME            Specify a reporter to use (can be
                                        repeated)
    -e, --server                        Start Intern in "server" mode (only run
                                        the proxy, don't run tests)
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

You can store default values for options in a JSON-formatted `.internrc` files in your home directory and in a `internrc.json` file in your project `node_modules` directory. If both files exist, settings in the project file will take precedence over the global file. In addition to the long options above, this file may also contain `config` and `suiteBase` options. For example:

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
