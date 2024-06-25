import * as vscode from 'vscode';
import { SonarService } from './gateway';
import * as path from 'path';
import { reporters } from 'mocha';

abstract class SonarController {
    protected sonarService: SonarService;
    protected currentPage: number = 1;
    protected pageSize: number = 100;
    protected total: number = 0;

    constructor(config: any) {
        this.sonarService = new SonarService(config);
    }

    async fetchNextPage(): Promise<Map<string, vscode.Diagnostic[]>> {
        const diagnosticsMap = new Map<string, vscode.Diagnostic[]>();
        return this._fetchNextPage(diagnosticsMap)
    }
    async fetchAllPages(): Promise<Map<string, vscode.Diagnostic[]>> {
        let allDiagnosticsMap = new Map<string, vscode.Diagnostic[]>();
        let moreIssues = true;
    
        while (moreIssues) {
            await this._fetchNextPage(allDiagnosticsMap);
           
            moreIssues = this.currentPage <= Math.ceil(this.total / this.pageSize);
        }
    
        return allDiagnosticsMap;
    }


    // protected abstract createDiagnostics(diagnosticsMap:   Map<string, vscode.Diagnostic[]>,items:any[]): Map<string, vscode.Diagnostic[]> ;
    protected createDiagnostics( diagnosticsMap :  Map<string, vscode.Diagnostic[]>, issues: any[]): Map<string, vscode.Diagnostic[]> {
    
        issues.forEach(issue => {
            const diagnostic = this.createDiagnosticFromItem(issue);
            // const filePath = issue.component.split(":")[1];  // Asegúrate que esta es la manera correcta de obtener el path
            const filePath = vscode.Uri.file(path.join(vscode.workspace.rootPath || '', issue.component.split(":")[1])).path;
            // console.log(filePath)
            if (!diagnosticsMap.has(filePath)) {
                diagnosticsMap.set(filePath, []);
            }
            diagnosticsMap.get(filePath)?.push(diagnostic);
        });
    
        return diagnosticsMap;
    }
    protected abstract createDiagnosticFromItem(issue: any): vscode.Diagnostic ;
    protected abstract  _fetchNextPage(diagnosticsMap :  Map<string, vscode.Diagnostic[]>): Promise<Map<string, vscode.Diagnostic[]>> ;
    public restart(){
        this.currentPage = 1
    }
}

class SonarIssueController  extends SonarController {
    // private sonarService: SonarService;
    // private currentPage: number = 1;
    // private pageSize: number = 100;
    // private total: number = 0;

    // constructor(config: any) {
    //     this.sonarService = new SonarService(config);
    // }
    createDiagnosticFromItem(issue: any): vscode.Diagnostic {
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
        diagnostic.source = 'SonarSyncIssues';
        // const commandUri = `command:extension.showProblemDetails?${encodeURIComponent(JSON.stringify(issue))}`;

    // Configura el mensaje de hover para incluir un enlace al comando
        // diagnostic.hoverMessage = new vscode.MarkdownString(`[Show Details](${commandUri})`);

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
    
    
    
    
}


class SecurityHotspotController extends SonarController {
    protected async _fetchNextPage(diagnosticsMap: Map<string, vscode.Diagnostic[]>): Promise<Map<string, vscode.Diagnostic[]>> {
        const response = await this.sonarService.fetchSecurityHotspots( this.currentPage, this.pageSize);
        if (response && response.hotspots) {
            console.log(response)
            // console.log(response.hotspot)
            this.total = response.paging.total;
            if (response.hotspots.length > 0) {
                this.currentPage++;
                return this.createDiagnostics(diagnosticsMap, response.hotspots);
            }
        }
        return diagnosticsMap;
    }

 

    protected createDiagnosticFromItem(hotspot: any): vscode.Diagnostic {
        const range = new vscode.Range(
            new vscode.Position(hotspot.line - 1, 0),
            new vscode.Position(hotspot.line - 1, Number.MAX_SAFE_INTEGER)
        );

        const severity = this.mapSonarSeverityToVsCodeSeverity(hotspot.vulnerabilityProbability);

        const diagnostic = new vscode.Diagnostic(
            range,
            `[Type: Security Hotspot] [Probability: ${hotspot.vulnerabilityProbability}] [Category: ${hotspot.securityCategory} ] ${hotspot.message}`,
            severity
        );
        diagnostic.code = hotspot.ruleKey;
        diagnostic.source = 'SonarSyncHospot';
        return diagnostic;
    }

    private mapSonarSeverityToVsCodeSeverity(sonarSeverity: string): vscode.DiagnosticSeverity {
        switch (sonarSeverity) {
            case 'HIGH':
                return vscode.DiagnosticSeverity.Error;
            case 'MEDIUM':
                return vscode.DiagnosticSeverity.Warning;
            case 'LOW':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }
}

export  {SonarIssueController,SecurityHotspotController}