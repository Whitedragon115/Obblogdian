import { BaseCommand } from "./base-command";

export class ServerCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "start-server",
            name: "Start Blog Server",
            callback: async () => {
                await this.startBlogServer();
            }
        });

        this.plugin.addCommand({
            id: "stop-server",
            name: "Stop Blog Server",
            callback: async () => {
                await this.stopBlogServer();
            }
        });

        this.plugin.addCommand({
            id: "deploy",
            name: "Deploy Blog",
            callback: async () => {
                await this.deployBlog();
            }
        });
    }

    private async startBlogServer() {
        try {
            await this.apiClient.sync();
            const serverLink = await this.apiClient.startServer();
            await navigator.clipboard.writeText(serverLink);
            this.settings.autoSync = true;
            await this.saveSettings();
        } catch (error) {
            console.error("Start server failed:", error);
        }
    }

    private async stopBlogServer() {
        try {
            await this.apiClient.stopServer();
            this.settings.autoSync = false;
            await this.saveSettings();
        } catch (error) {
            console.error("Stop server failed:", error);
        }
    }

    private async deployBlog() {
        try {
            await this.apiClient.sync();
            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.apiClient.deploy(false);
        } catch (error) {
            console.error("Deploy failed:", error);
        }
    }
}
