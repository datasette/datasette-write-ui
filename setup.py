from setuptools import setup
import os

VERSION = "0.0.1a11"


def get_long_description():
    with open(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "README.md"),
        encoding="utf8",
    ) as fp:
        return fp.read()


setup(
    name="datasette-write-ui",
    description="",
    long_description=get_long_description(),
    long_description_content_type="text/markdown",
    author="Alex Garcia",
    url="https://github.com/datasette/datasette-write-ui",
    project_urls={
        "Issues": "https://github.com/datasette/datasette-write-ui/issues",
        "CI": "https://github.com/datasette/datasette-write-ui/actions",
        "Changelog": "https://github.com/datasette/datasette-write-ui/releases",
    },
    license="Apache License, Version 2.0",
    classifiers=[
        "Framework :: Datasette",
        "License :: OSI Approved :: Apache Software License",
    ],
    version=VERSION,
    packages=["datasette_write_ui"],
    entry_points={"datasette": ["datasette_write_ui = datasette_write_ui"]},
    install_requires=["datasette>=1.0a1", "sqlite-utils"],
    extras_require={"test": ["pytest", "pytest-asyncio"]},
    package_data={"datasette_write_ui": ["static/*", "templates/*"]},
    python_requires=">=3.8",
)
