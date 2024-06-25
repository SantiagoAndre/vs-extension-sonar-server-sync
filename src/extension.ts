// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import  {SonarIssueController,SecurityHotspotController}  from './controller';
import * as path from 'path';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export  async function activate(context: vscode.ExtensionContext) {
    const config = await getSonarConfig();
    if (!config) {
        vscode.window.showErrorMessage("SonarQube configuration not found in .vscode/sonar-config.json");
        return;
    }

     // Crear colecciones de diagnósticos globales
     const issuesDiagnostics = vscode.languages.createDiagnosticCollection('sonarIssues');
     const hotspotsDiagnostics = vscode.languages.createDiagnosticCollection('sonarHotspots');
 
     context.subscriptions.push(issuesDiagnostics, hotspotsDiagnostics);
 
     // Asegúrate de inicializar y configurar tus loaders aquí
     const issueLoader = new SonarIssueController(config);
     const securityLoader = new SecurityHotspotController(config);
 
     // Implementación de comandos con reutilización de colecciones globales
     const loadIssuesCommand = vscode.commands.registerCommand('sonarext.loadSonarIssues', async () => {
         const diagnostics = await issueLoader.fetchNextPage();
         const count = updateDiagnostics(diagnostics, issuesDiagnostics);
         vscode.window.showInformationMessage(`Fetched a page of SonarQube issues. Total: ${count}`);
     });
 
     const loadAllIssuesCommand = vscode.commands.registerCommand('sonarext.loadAllSonarIssues', async () => {
         const diagnostics = await issueLoader.fetchAllPages();
         const count = updateDiagnostics(diagnostics, issuesDiagnostics);
         vscode.window.showInformationMessage(`All SonarQube issues loaded. Total issues loaded: ${count}`);
     });
 
     const loadSecurityHotspotsCommand = vscode.commands.registerCommand('sonarext.loadSecurityHostpots', async () => {
         const diagnostics = await securityLoader.fetchNextPage();
         const count = updateDiagnostics(diagnostics, hotspotsDiagnostics);
         vscode.window.showInformationMessage(`Fetched a page of SonarQube security hotspots. Total: ${count}`);
     });
 
     const loadAllSecurityHotspotsCommand = vscode.commands.registerCommand('sonarext.loadAllSecurityHostpots', async () => {
         const diagnostics = await securityLoader.fetchAllPages();
         const count = updateDiagnostics(diagnostics, hotspotsDiagnostics);
         vscode.window.showInformationMessage(`All SonarQube security hotspots loaded. Total issues loaded: ${count}`);
     });
 
     const clearIssuesCommand = vscode.commands.registerCommand('sonarext.clearIssues', () => {
         issuesDiagnostics.clear();
         vscode.window.showInformationMessage('All SonarQube issues have been cleared.');
         issueLoader.restart()
     });
 
     const clearHotspotsCommand = vscode.commands.registerCommand('sonarext.clearHotspots', () => {
         hotspotsDiagnostics.clear();
         vscode.window.showInformationMessage('All SonarQube Hotspots have been cleared.');
         securityLoader.restart()
     });
 
     context.subscriptions.push(loadIssuesCommand, loadAllIssuesCommand, loadSecurityHotspotsCommand, loadAllSecurityHotspotsCommand, clearIssuesCommand, clearHotspotsCommand);
 }
 function updateDiagnostics(diagnosticsMap: Map<string, vscode.Diagnostic[]>, diagnosticsCollection: vscode.DiagnosticCollection): number {
    let totalDiagnostics = 0;
    // diagnosticsCollection.clear(); // Opcional, descomentar si deseas limpiar antes de actualizar
    let count =  0
    diagnosticsMap.forEach((diagnostics, fileUri) => {
        count+=diagnostics.length
        const uri = vscode.Uri.file(fileUri);

        // Verificar y combinar diagnósticos existentes si es necesario
        let existingDiagnostics = diagnosticsCollection.get(uri) || [];
        let combinedDiagnostics = existingDiagnostics.concat(diagnostics);
        console.log("combinedDiagnostics")
        console.log(fileUri)
        console.log(combinedDiagnostics)
        if(existingDiagnostics.length>0){
            console.log("found")
        }
        // Establecer los diagnósticos combinados en la colección
        diagnosticsCollection.set(uri, combinedDiagnostics);

        // Actualizar el contador total de diagnósticos
        totalDiagnostics += diagnostics.length;
    });
    console.log("adding "+count)
    // console.log("adding "+count)
    console.log("------ fimal diasnotics collection ------")    
    console.log(diagnosticsCollection)

    return totalDiagnostics;
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
