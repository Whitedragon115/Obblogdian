import { BaseCommand } from "./base-command";

export class ServerCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "blog-server-start",
            name: "Start Blog Server",
            callback: async () => {
                await this.startBlogServer();
            }
        });

        this.plugin.addCommand({
            id: "blog-server-close",
            name: "Stop Blog Server",
            callback: async () => {
                await this.stopBlogServer();
            }
        });

        this.plugin.addCommand({
            id: "deploy-blog",
            name: "Deploy Blog",
            callback: async () => {
                await this.deployBlog();
            }
        });

        this.plugin.addCommand({
            id: "deploy-blog-keepserver",
            name: "Deploy Blog and Keep Server",
            callback: async () => {
                await this.deployBlogKeepServer();
            }
        });
    }

    private async startBlogServer() {
        try {
            // 先同步
            await this.apiClient.sync();
            
            // 啟動服務器
            const serverLink = await this.apiClient.startServer();
            
            // 複製連結到剪貼板
            await navigator.clipboard.writeText(serverLink);
            
            // 更新設定
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
            // 先同步
            await this.apiClient.sync();
            
            // 等待 1.5 秒
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 部署
            await this.apiClient.deploy(false);
        } catch (error) {
            console.error("Deploy failed:", error);
        }
    }

    private async deployBlogKeepServer() {
        try {
            this.settings.autoSync = true;
            await this.saveSettings();
            
            // 先同步
            await this.apiClient.sync();
            
            // 等待 1.5 秒
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 部署並保持服務器
            const serverLink = await this.apiClient.deploy(true);
            if (serverLink) {
                await navigator.clipboard.writeText(serverLink);
            }
        } catch (error) {
            console.error("Deploy with keep server failed:", error);
        }
    }
}
