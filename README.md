# datasette-write-ui

[![PyPI](https://img.shields.io/pypi/v/datasette-write-ui.svg)](https://pypi.org/project/datasette-write-ui/)
[![Changelog](https://img.shields.io/github/v/release/asg017/datasette-write-ui?include_prereleases&label=changelog)](https://github.com/asg017/datasette-write-ui/releases)
[![Tests](https://github.com/asg017/datasette-write-ui/workflows/Test/badge.svg)](https://github.com/asg017/datasette-write-ui/actions?query=workflow%3ATest)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/asg017/datasette-write-ui/blob/main/LICENSE)

## Work in progress!

Still being built, missing key features and safety.

## Installation

Install this plugin in the same environment as Datasette.

    datasette install datasette-write-ui

## Usage

Usage instructions go here.

## Development

To set up this plugin locally, first checkout the code. Then create a new virtual environment:

    cd datasette-write-ui
    python3 -m venv venv
    source venv/bin/activate

Now install the dependencies and test dependencies:

    pip install -e '.[test]'

To run the tests:

    pytest

## TODO

- [ ] check for permissions
- [ ] insert
- [ ] delete
- [ ] plugin config for input (text vs textarea, )
- [ ] blob file input
