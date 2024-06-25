# SonarQube Issues Loader for Visual Studio Code

This Visual Studio Code extension allows you to load and view SonarQube issues directly within the development environment, making it easier to review and address code issues without leaving the editor.

## Features

- Loads SonarQube issues using customized settings.
- Displays issues in the "Problems" tab of Visual Studio Code.
- Supports paginated loading of more issues through a command.

## Prerequisites

Before installing and using this extension, ensure you have the following:

- Node.js installed on your system.
- Visual Studio Code installed.
- Access to a SonarQube server with configured projects.

## Configuration

1. **Create Configuration File**: For the extension to function, you need to create a configuration file named `sonar-config.json`. This file should be located in the `.vscode` folder at the root of your project.

2. **Configuration File Format**: The configuration file should have the following format:

   ```json
   {
       "host": "SONARQUBE_SERVER_URL",
       "token": "YOUR_ACCESS_TOKEN",
       "projectKey": "PROJECT_KEY"
   }
   ```

   Replace `SONARQUBE_SERVER_URL`, `YOUR_ACCESS_TOKEN`, and `PROJECT_KEY` with the appropriate values for your SonarQube setup.

## Usage

Once the extension is configured, you can load SonarQube issues as follows:

1. **Open Visual Studio Code** and make sure you are working in the project directory that has the `sonar-config.json` configured.

2. **Run the Command**: Open the command palette with `Ctrl+Shift+P` and type `Load Sonar Issues`. Select the `Load Sonar Issues` command to start loading issues.

   *Each execution* of the command loads the next page of SonarQube issues, assuming more issues are available to load.

## Issues and Support

If you encounter any problems using the extension or have suggestions for improvements, please feel free to create an issue on the extension's GitHub repository.

## Contributing

If you are interested in contributing to the extension, please read the `CONTRIBUTING.md` file for more details on how you can do so.

## License

This extension is licensed under the MIT License. See the `LICENSE` file for more details.
