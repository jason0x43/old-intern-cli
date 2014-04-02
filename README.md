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
usage: intern CONFIG [OPTIONS]
options:
    -V, --version                       Show the version number and exit
    -b NAME, --browser=NAME             Use this browser (e.g., "chrome") when
                                        testing locally (can be repeated)
    -c, --client                        Use Node.js client instead of WebDriver
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
    -v, --verbose                       Be more verbose; show debugging messages
    -C, --no-color                      Disable terminal color support
```

* Run intern:

`intern tests/intern`

* Run a particular suite

`intern tests/intern -s app/tests/foo`

## Configuration

You can store default values for options in a JSON-formatted `.internrc` file in your project. In addition to the long options above, this file may also contain `config` and `suiteBase` options. For example:

```
{
    "config": "tests/intern",
	"suiteBase": "myapp/tests"
}
```

Setting these will let you run your default tests just by typing `intern`. You could run the `foo` suite with just:

`intern -s foo`
