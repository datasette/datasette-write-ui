# datasette-write-ui

[![PyPI](https://img.shields.io/pypi/v/datasette-write-ui.svg)](https://pypi.org/project/datasette-write-ui/)
[![Changelog](https://img.shields.io/github/v/release/datasette/datasette-write-ui?include_prereleases&label=changelog)](https://github.com/datasette/datasette-write-ui/releases)
[![Tests](https://github.com/datasette/datasette-write-ui/workflows/Test/badge.svg)](https://github.com/datasette/datasette-write-ui/actions?query=workflow%3ATest)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/datasette/datasette-write-ui/blob/main/LICENSE)

A Datasette plugin that adds UI elements to edit, insert, or delete rows in SQLite tables.

## Installation

This plugin requires the alpha version of Datasette 1.0. You can install it with:

```bash
pip install datasette==1.0a3
```

After that, you can install this plugin in the same environment as Datasette.

```bash
datasette install datasette-write-ui
```

## Usage

Once installed, the new UI elements will appear on the table page. You'll need special permission in order to see them. The easiest way is to [use the root user](https://docs.datasette.io/en/latest/authentication.html#using-the-root-actor), or otherwise use a [custom actor](https://docs.datasette.io/en/latest/authentication.html#actors).

<img width=600 src="https://camo.githubusercontent.com/f02dbf756d3ba7ed148a9e7263eb045fafcbb549733f37cd1350aafe54ff2c9f/68747470733a2f2f6461746173657474652d636c6f75642d6173736574732e73332e616d617a6f6e6177732e636f6d2f626c6f672f323032332f696e74726f647563696e672d6461746173657474652d77726974652d75692f75692d7461626c652d73637265656e73686f742e6a7067"/>

If you actor has the `insert-row` permissions, you'll see the "Insert new row" button at the bottom of the page.

<video src="https://datasette-cloud-assets.s3.amazonaws.com/blog/2023/introducing-datasette-write-ui/insert-demo.mp4" width=600 controls autoplay type="video/mp4" ></video>

If your actor has the `update-row` permissions, you'll see a new "Edit row" option in a new menu on each row.

<video src="https://datasette-cloud-assets.s3.amazonaws.com/blog/2023/introducing-datasette-write-ui/edit-demo.mp4" width=600 controls autoplay type="video/mp4" ></video>

If your actor has the `delete-row` permissions, you'll see a new "Delete row" option in a new menu on each row.

<video src="https://datasette-cloud-assets.s3.amazonaws.com/blog/2023/introducing-datasette-write-ui/delete-demo.mp4" width=600 controls autoplay type="video/mp4" ></video>

## Development

To set up this plugin locally, first checkout the code. Then create a new virtual environment:
```bash
cd datasette-write-ui
python3 -m venv venv
source venv/bin/activate
```
Now install the dependencies and test dependencies:
```
pip install -e '.[test]'
```
To install the JavaScript build dependencies, run this:
```bash
npm install
```
You can use the [Just](https://github.com/casey/just) command runner to build the TypeScript to minified JavaScript like this:
```bash
just js
```
To run the tests:
```bash
pytest
```
