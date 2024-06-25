import axios from 'axios';

export class SonarService {
    constructor(private config: { host: string, token: string, projectKey: string }) {}

    async fetchIssues(page: number, pageSize: number) {
        const { host, token, projectKey } = this.config;
        const url = `${host}/api/issues/search?componentKeys=${projectKey}&statuses=OPEN&p=${page}&ps=${pageSize}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Basic ${Buffer.from(`${token}:`).toString('base64')}` }
        });
        console.log(response)
        return response.data;
    }
    async fetchSecurityHotspots(projectKey: string, page: number, pageSize: number): Promise<any> {
        const url = `${this.config.host}/api/hotspots/search?projectKey=${projectKey}&p=${page}&ps=${pageSize}`;
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Basic ${Buffer.from(`${this.config.token}:`).toString('base64')}` },
                method: 'GET'
            });
            return response.json();
        } catch (error) {
            console.error('Error fetching security hotspots:', error);
            throw new Error('Failed to fetch security hotspots');
        }
    }
}
