// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import  SonarIssueLoader  from './controller';
import * as path from 'path';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export  async function activate(context: vscode.ExtensionContext) {
    const config = await getSonarConfig();
    if (!config) {
        vscode.window.showErrorMessage("SonarQube configuration not found in .vscode/sonar-config.json");
        return;
    }

    let issueLoader = new SonarIssueLoader(config);

    const loadIssuesCommand = vscode.commands.registerCommand('sonarext.loadSonarIssues', async () => {
        const diagnostics: Map<string, vscode.Diagnostic[]> = await issueLoader.fetchNextPage();
        const count = updateDiagnostics(context,diagnostics);
        vscode.window.showInformationMessage(`Fetched a page of SonarQube issues. total: ${count}`);
    });

    const loadAllIssuesCommand = vscode.commands.registerCommand('sonarext.loadAllSonarIssues', async () => {
        const diagnostics = await issueLoader.fetchAllIssues();
        const count  =updateDiagnostics(context,diagnostics);
        vscode.window.showInformationMessage(`All SonarQube issues loaded. Total issues loaded: ${count}`);
    });
    
    context.subscriptions.push(loadIssuesCommand, loadAllIssuesCommand);
}
function updateDiagnostics(context: vscode.ExtensionContext,diagnosticsMap: Map<string, vscode.Diagnostic[]>):Number {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('sonarlint');
    let count  =  0
    diagnosticsMap.forEach((diags, file) => {
        diagnosticsCollection.set(vscode.Uri.parse(file), diags);
        count+= diags.length
    });
    context.subscriptions.push(diagnosticsCollection);
    return count
}



async function getSonarConfig() {
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






// This method is called when your extension is deactivated
export function deactivate() {}
