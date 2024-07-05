// Import necessary modules
import * as vscode from 'vscode';
import * as fs from 'fs';
import { SonarIssueController, SecurityHotspotController } from './controller';

// Define a class for the extension
class SonarQubeExtension {
    private issueLoader: SonarIssueController= {} as SonarIssueController ;
    private securityLoader: SecurityHotspotController = {} as SecurityHotspotController;
    private issuesDiagnostics: vscode.DiagnosticCollection = {} as vscode.DiagnosticCollection;
    private hotspotsDiagnostics: vscode.DiagnosticCollection = {} as vscode.DiagnosticCollection;

    constructor(private context: vscode.ExtensionContext) {}

    // Method to activate the extension
    async activate() {
        const config = await this.getSonarConfig();
        if (!config) {
            vscode.window.showErrorMessage("SonarQube configuration not found in .vscode/sonar-config.json");
            return;
        }

        // Create diagnostic collections
        this.issuesDiagnostics = vscode.languages.createDiagnosticCollection('sonarIssues');
        this.hotspotsDiagnostics = vscode.languages.createDiagnosticCollection('sonarHotspots');

        // Initialize loaders
        this.issueLoader = new SonarIssueController(config);
        this.securityLoader = new SecurityHotspotController(config);

        // Register commands
        this.registerCommands();
    }

    // Method to register VS Code commands
    private registerCommands() {
        this.context.subscriptions.push(
            vscode.commands.registerCommand('sonarext.loadSonarIssues', async () => {
                const diagnostics = await this.issueLoader.fetchNextPage();
                const count = this.updateDiagnostics(diagnostics, this.issuesDiagnostics);
                vscode.window.showInformationMessage(`Fetched a page of SonarQube issues. Total: ${count}`);
            }),

            vscode.commands.registerCommand('sonarext.loadAllSonarIssues', async () => {
                const diagnostics = await this.issueLoader.fetchAllPages();
                const count = this.updateDiagnostics(diagnostics, this.issuesDiagnostics);
                vscode.window.showInformationMessage(`All SonarQube issues loaded. Total issues loaded: ${count}`);
            }),

            vscode.commands.registerCommand('sonarext.loadSecurityHostpots', async () => {
                const diagnostics = await this.securityLoader.fetchNextPage();
                const count = this.updateDiagnostics(diagnostics, this.hotspotsDiagnostics);
                vscode.window.showInformationMessage(`Fetched a page of SonarQube security hotspots. Total: ${count}`);
            }),

            vscode.commands.registerCommand('sonarext.loadAllSecurityHostpots', async () => {
                const diagnostics = await this.securityLoader.fetchAllPages();
                const count = this.updateDiagnostics(diagnostics, this.hotspotsDiagnostics);
                vscode.window.showInformationMessage(`All SonarQube security hotspots loaded. Total issues loaded: ${count}`);
            }),

            vscode.commands.registerCommand('sonarext.clearIssues', () => {
                this.issuesDiagnostics.clear();
                vscode.window.showInformationMessage('All SonarQube issues have been cleared.');
                this.issueLoader.restart();
            }),

            vscode.commands.registerCommand('sonarext.clearHotspots', () => {
                this.hotspotsDiagnostics.clear();
                vscode.window.showInformationMessage('All SonarQube Hotspots have been cleared.');
                this.securityLoader.restart();
            })
        );
    }

    // Helper method to update diagnostics in the collection
    private updateDiagnostics(diagnosticsMap: Map<string, vscode.Diagnostic[]>, diagnosticsCollection: vscode.DiagnosticCollection): number {
        let totalDiagnostics = 0;
        diagnosticsMap.forEach((diagnostics, fileUri) => {
            const uri = vscode.Uri.file(fileUri);
            let existingDiagnostics = diagnosticsCollection.get(uri) || [];
            let combinedDiagnostics = existingDiagnostics.concat(diagnostics);
            diagnosticsCollection.set(uri, combinedDiagnostics);
            totalDiagnostics += diagnostics.length;
        });
        return totalDiagnostics;
    }

    // Method to load SonarQube configuration from the .vscode folder
    private async getSonarConfig(): Promise<any> {
        try {
            const files = await vscode.workspace.findFiles('.vscode/sonar-config.json', '**​/.vscode/**', 1);
            if (files.length > 0) {
                const content = fs.readFileSync(files[0].fsPath, 'utf8');
                return JSON.parse(content);
            }
            return null;
        } catch (e) {
            console.error("Error reading SonarQube configuration:", e);
            return null;
        }
    }

    // Method to deactivate the extension
    deactivate() {}
}

// Export a function to activate the extension
export async  function activate(context: vscode.ExtensionContext) {
    const extension = new SonarQubeExtension(context);
    await extension.activate();
}

export function deactivate() {
}



