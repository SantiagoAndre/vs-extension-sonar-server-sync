# SonarQube Issues Loader for Visual Studio Code

This Visual Studio Code extension allows you to load and view SonarQube issues directly within the development environment, making it easier to review and address code issues without leaving the editor.

## Features

- Loads SonarQube issues and security hospots using customized settings.
- Displays them in the "Problems" tab of Visual Studio Code.
- Supports paginated loading of more items through a command.

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

This extension provides several commands for interacting with SonarQube to fetch and manage issues and security hotspots directly within Visual Studio Code. Below is a description of each command and its function:

- **Fetch Sonar Issues (`sonarext.loadSonarIssues`)**
  - **Description**: Loads the next page of SonarQube issues into the Visual Studio Code "Problems" tab. Use this command to incrementally fetch issues from SonarQube.
  - **Usage**: Open the command palette (`Ctrl+Shift+P`), type "Fetch Sonar Issues", and execute the command.

- **Fetch ALL Sonar Issues (`sonarext.loadAllSonarIssues`)**
  - **Description**: Fetches all available SonarQube issues at once and displays them in the "Problems" tab. Ideal for a comprehensive overview when starting a new session or after significant code changes.
  - **Usage**: Open the command palette, type "Fetch ALL Sonar Issues", and execute the command.

- **Fetch Security Hotspots (`sonarext.loadSecurityHostpots`)**
  - **Description**: Loads the next page of SonarQube security hotspots into the "Problems" tab. This command is useful for reviewing potential security risks in the code.
  - **Usage**: Open the command palette, type "Fetch Security Hotspots", and execute the command.

- **Fetch ALL Security Hotspots (`sonarext.loadAllSecurityHostpots`)**
  - **Description**: Retrieves all SonarQube security hotspots available and displays them in the "Problems" tab. Use this command to perform a thorough review of all security concerns identified by SonarQube.
  - **Usage**: Open the command palette, type "Fetch ALL Security Hotspots", and execute the command.

- **Clear All Security Hotspots Problems (`sonarext.clearHotspots`)**
  - **Description**: Clears all loaded security hotspot entries from the "Problems" tab, helping you to reset or refresh the current analysis view.
  - **Usage**: Open the command palette, type "Clear All Security Hotspots Problems", and execute the command.

- **Clear All Issues Problems (`sonarext.clearIssues`)**
  - **Description**: Clears all issue entries from the "Problems" tab. This command is useful for cleaning up after addressing issues or when needing to refresh the analysis.
  - **Usage**: Open the command palette, type "Clear All Issues Problems", and execute the command.

### Additional Information

To ensure that these commands perform as expected, ensure that your SonarQube server is properly configured and accessible from your development environment. Each command is intended to enhance your workflow by integrating SonarQube's capabilities directly within Visual Studio Code, allowing for a seamless code quality and security review process.
## Issues and Support

If you encounter any problems using the extension or have suggestions for improvements, please feel free to create an issue on the extension's GitHub repository.

## Contributing

If you are interested in contributing to the extension, please read the `CONTRIBUTING.md` file for more details on how you can do so.

## License

This extension is licensed under the MIT License. See the `LICENSE` file for more details.
