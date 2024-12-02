# Formatting

This directory contains the Eclipse formatting configuration files used to enforce the same code style for all contributors working on the frontend project. These configurations apply specifically to **JavaScript** and **TypeScript**.

## Eclipse
To import the formatting configurations into Eclipse for JavaScript and TypeScript:

1. Open **Eclipse**.
2. Navigate to **Preferences** (or **Settings**).
3. Go to **JavaScript** → **Code Style** → **Formatter**.
4. Click **Import** and select the `eclipse-js-formatter.xml` file from this folder.
5. Similarly, go to **JavaScript** → **Code Style** → **Clean Up** and import the `eclipse-js-cleanup.xml` file.

For TypeScript, ensure that your TypeScript files are treated with the same rules as JavaScript within Eclipse.

## IntelliJ
The IntelliJ plugin for Eclipse Formatter can also be used to format JavaScript and TypeScript files.

1. Install the IntelliJ plugin: [Adapter for Eclipse Code Formatter](https://plugins.jetbrains.com/plugin/6546-adapter-for-eclipse-code-formatter).
2. Open **Settings** → **Code Style** → **JavaScript** (and **TypeScript**, if applicable).
3. Add the `eclipse-js-formatter.xml` file as the formatter configuration.

Note: IntelliJ does not support all configurations from the Eclipse formatter. Adjust manually where needed.

## Visual Studio Code (VSCode)
VS Code's built-in JavaScript/TypeScript formatter provides basic code formatting with reasonable defaults.

The javascript.format.* / typescript.format.* [settings](https://code.visualstudio.com/docs/getstarted/settings) 
configure the built-in formatter. 
Or, if the built-in formatter is getting in the way, set "javascript.format.enable" to false to disable it.

For more specialized code formatting styles, try installing one of the JavaScript/Typescript
formatting extensions from the VSCode Marketplace ( https://marketplace.visualstudio.com/vscode ).
