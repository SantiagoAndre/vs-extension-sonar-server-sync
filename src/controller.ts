import * as vscode from 'vscode';
import { SonarService } from './gateway';
import * as path from 'path';

class SonarIssueLoader {
    private sonarService: SonarService;
    private currentPage: number = 1;
    private pageSize: number = 100;
    private total: number = 0;

    constructor(config: any) {
        this.sonarService = new SonarService(config);
    }
    createDiagnosticFromIssue(issue: any): vscode.Diagnostic {
        const range = new vscode.Range(
            new vscode.Position(issue.line - 1, 0), // assuming 'line' is 1-based index
            new vscode.Position(issue.line - 1, Number.MAX_SAFE_INTEGER)
        );
    
        // Map SonarQube severity to VS Code severity
        const severity = this.mapSonarSeverityToVsCodeSeverity(issue.severity);
    
        const diagnostic = new vscode.Diagnostic(
            range,
            `[Type: ${issue.type}] [Severity: ${issue.severity}] ${issue.message}`,
            severity
        );
        diagnostic.code = issue.rule;
        diagnostic.source = 'SonarLintFetch';
        return diagnostic;
    }
    mapSonarSeverityToVsCodeSeverity(sonarSeverity: string): vscode.DiagnosticSeverity {
        switch (sonarSeverity) {
            case 'BLOCKER':
                return vscode.DiagnosticSeverity.Error;
            case 'CRITICAL':
                return vscode.DiagnosticSeverity.Error;
            case 'MAJOR':
                return vscode.DiagnosticSeverity.Error;
            case 'MINOR':
                return vscode.DiagnosticSeverity.Warning;
            case 'INFO':
                return vscode.DiagnosticSeverity.Hint;
            default:
                return vscode.DiagnosticSeverity.Warning; // Default case if severity is not recognized
        }
    }
    async _fetchNextPage(diagnosticsMap :  Map<string, vscode.Diagnostic[]>): Promise<Map<string, vscode.Diagnostic[]>> {
        const response = await this.sonarService.fetchIssues(this.currentPage, this.pageSize);
        if (response && response.issues) {
            this.total = response.paging.total;
            if (response.issues.length > 0) {
                this.currentPage++;
            }

            return this.createDiagnostics(diagnosticsMap,response.issues);
        }
        return new Map();
    }
    async fetchNextPage(): Promise<Map<string, vscode.Diagnostic[]>> {
        const diagnosticsMap = new Map<string, vscode.Diagnostic[]>();
        return this._fetchNextPage(diagnosticsMap)
    }

    async fetchAllIssues(): Promise<Map<string, vscode.Diagnostic[]>> {
        let allDiagnosticsMap = new Map<string, vscode.Diagnostic[]>();
        let moreIssues = true;
    
        while (moreIssues) {
            allDiagnosticsMap = await this._fetchNextPage(allDiagnosticsMap);
           
            moreIssues = this.currentPage <= Math.ceil(this.total / this.pageSize);
        }
    
        return allDiagnosticsMap;
    }

    private createDiagnostics( diagnosticsMap :  Map<string, vscode.Diagnostic[]>, issues: any[]): Map<string, vscode.Diagnostic[]> {
    
        issues.forEach(issue => {
            const diagnostic = this.createDiagnosticFromIssue(issue);
            // const filePath = issue.component.split(":")[1];  // Asegúrate que esta es la manera correcta de obtener el path
            const filePath = vscode.Uri.file(path.join(vscode.workspace.rootPath || '', issue.component.split(":")[1])).toString();

            if (!diagnosticsMap.has(filePath)) {
                diagnosticsMap.set(filePath, []);
            }
            diagnosticsMap.get(filePath)?.push(diagnostic);
        });
    
        return diagnosticsMap;
    }
    
}

export default SonarIssueLoader