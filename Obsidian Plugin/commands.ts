import { Notice, TFile, Plugin } from "obsidian";
import * as path from "path";
import { ApiClient } from "./api-client";
import { MarkdownRenderer } from "./markdown-renderer";
import { MyPluginSettings } from "./settings";
import { setTabs, setHidden } from "./utils";

let split_filename = "";

export class CommandManager {
    private apiClient: ApiClient;
    private markdownRenderer: MarkdownRenderer;

    constructor(
        private plugin: Plugin,
        private settings: MyPluginSettings,
        private saveSettings: () => Promise<void>
    ) {
        this.apiClient = new ApiClient(settings);
        this.markdownRenderer = new MarkdownRenderer();
    }

    registerCommands() {
        this.plugin.addCommand({
            id: "meta-create",
            name: "Create Meta Data",
            callback: async () => {
                await this.createMetadata();
            }
        });

        this.plugin.addCommand({
            id: "sync-blog",
            name: "Sync Blog",
            callback: async () => {
                await this.syncBlog();
            }
        });

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

        this.plugin.addCommand({
            id: "view-blog-obsidian",
            name: "View Blog in here",
            callback: async () => {
                await this.viewBlogInObsidian();
            }
        });

        this.plugin.addCommand({
            id: "render-all-blog",
            name: "Render All Blog Markdown",
            callback: async () => {
                await this.renderAllBlog();
            }
        });

        this.plugin.addCommand({
            id: "render-auto-update",
            name: "Auto Render Markdown",
            callback: async () => {
                await this.toggleAutoUpdate();
            }
        });

        this.plugin.addCommand({
            id: "sync-auto-update",
            name: "Auto Sync Markdown to Server",
            callback: async () => {
                await this.toggleAutoSync();
            }
        });
    }

    private async createMetadata() {
        const openMdFile = this.plugin.app.workspace.getActiveFile();
        if (!openMdFile) {
            new Notice("No active file open");
            return;
        }

        // format 2024-09-26 19:55:11
        const nowTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        const metaLines = [
            '---',
            `title: ${openMdFile.basename.replace(".md", "")}`,
            'tags: REPLACE_ME',
            'excerpt: REPLACE_ME',
            "cover: IMAGE_LINK",
            `date: ${nowTime}`,
            '---'
        ];

        const metaContent = metaLines.join("\n");
        const content = await this.plugin.app.vault.read(openMdFile);
        await this.plugin.app.vault.modify(openMdFile, metaContent.trim() + "\n" + content);
        new Notice("Meta Data created successfully");
    }

    private async syncBlog() {
        try {
            await this.apiClient.sync();
        } catch (error) {
            console.error("Sync failed:", error);
        }
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

    private async viewBlogInObsidian() {
        console.log("enter");
        const openMdFile = this.plugin.app.workspace.getActiveFile();
        if (!openMdFile) {
            new Notice("No active file open");
            return;
        }

        if (!openMdFile.path.includes("Write Area")) {
            new Notice("This command only works in Write Area");
            return;
        }

        await this.markdownRenderer.renderMarkdown(openMdFile.path, this.plugin.app.vault.adapter);

        setTabs();
        setHidden();

        const previewFilePath = path.join(openMdFile.path.replace(/Write Area/gi, "Preview Area")).replace(/\\/g, '/');
        const file = this.plugin.app.vault.getAbstractFileByPath(previewFilePath) as TFile;

        if (file.basename === split_filename) return;
        if (!file) {
            new Notice("File not found");
            return;
        }
        
        split_filename = file.basename;
        // 在右側開啟當前檔案的 preview 模式
        const newLeaf = this.plugin.app.workspace.getLeaf('split', 'vertical');
        await newLeaf.openFile(file, { state: { mode: 'preview', active: false, focus: false } });
    }

    private async renderAllBlog() {
        const files = this.plugin.app.vault.getMarkdownFiles();
        for (const file of files) {
            await this.markdownRenderer.renderMarkdown(file.path, this.plugin.app.vault.adapter);
        }
        new Notice("All Markdown files have been rendered");
    }

    private async toggleAutoUpdate() {
        this.settings.autoUpdate = !this.settings.autoUpdate;
        await this.saveSettings();
        new Notice(`Auto Update is ${this.settings.autoUpdate ? "enabled" : "disabled"}`);
    }

    private async toggleAutoSync() {
        this.settings.autoSync = !this.settings.autoSync;
        await this.saveSettings();
        new Notice(`Auto Sync is ${this.settings.autoSync ? "enabled" : "disabled"}`);
    }

    async handleEditorChange() {
        const openMdFile = this.plugin.app.workspace.getActiveFile();

        if (!openMdFile?.path.includes("Write Area")) return;

        if (this.settings.autoUpdate) {
            console.log("Rendering...");

            if (!openMdFile) {
                new Notice("No active file open");
                return;
            }

            await this.markdownRenderer.renderMarkdown(openMdFile.path, this.plugin.app.vault.adapter);
            setTabs();
            setHidden();
            console.log("Render completed");
        }

        if (this.settings.autoSync) {
            console.log("Syncing...");
            await this.apiClient.quickSync();
        }
    }
}
