import { Notice } from "obsidian";
import { BaseCommand } from "./base-command";

export class RenderCommands extends BaseCommand {
    registerCommands() {

        this.plugin.addCommand({
            id: "render-blog",
            name: "Render Blog Markdown",
            callback: async () => {
                await this.renderBlog();
            }
        })

        this.plugin.addCommand({
            id: "render-all-blog",
            name: "Render All",
            callback: async () => {
                await this.renderAllBlog();
            }
        });

        this.plugin.addCommand({
            id: "render-auto-update",
            name: "Auto Render Update",
            callback: async () => {
                await this.toggleAutoUpdate();
            }
        });

        this.plugin.addCommand({
            name: "clean-temp-files",
            id: "Clean Temp",
            callback: async () => {
                await this.cleanTempFiles();
            }
        })

    }

    private async renderBlog() {

        if (!this.settings.blogFolder) return new Notice("Blog folder is not set in settings.\nPlease set it in the plugin settings.");
        if (!this.plugin.app.vault.getAbstractFileByPath(this.settings.blogFolder)) {
            await this.plugin.app.vault.createFolder(this.settings.blogFolder);
        }

        const activeFile = this.plugin.app.workspace.getActiveFile();

        if (activeFile && !activeFile.path.startsWith(this.settings.blogFolder)) return new Notice("This command only works in the blog folder");
        if (!activeFile?.path.endsWith(".md")) return new Notice("No active Markdown file to render");

        await this.markdownRenderer.renderMarkdown(activeFile.path, this.plugin.app.vault.adapter);
        return new Notice(`Rendered ${activeFile.name}`);

    }

    private async renderAllBlog() {
        const files = this.plugin.app.vault.getMarkdownFiles();
        for (const file of files) await this.markdownRenderer.renderMarkdown(file.path, this.plugin.app.vault.adapter);
        return new Notice("All Markdown files have been rendered");
    }

    private async toggleAutoUpdate() {
        this.settings.autoUpdate = !this.settings.autoUpdate;
        await this.saveSettings();
        return new Notice(`Auto Update is ${this.settings.autoUpdate ? "enabled" : "disabled"}`);
    }

    private async cleanTempFiles() {
        const tempFolder = this.settings.blogFolder + "/~temp";
        const tempFiles = this.plugin.app.vault.getFiles().filter(file => file.path.startsWith(tempFolder));
        for (const file of tempFiles) await this.plugin.app.vault.trash(file, true);
        return new Notice("Temporary files cleaned up");
    }
}
