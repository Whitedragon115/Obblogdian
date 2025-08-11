import { Notice, TFile } from "obsidian";
import * as path from "path";
import { BaseCommand } from "./base-command";
import { setTabs, setHidden } from "../utils";

let split_filename = "";

export class ViewCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "view-blog-obsidian",
            name: "Preview Blog",
            hotkeys: [
                {
                    modifiers: ["Ctrl"],
                    key: "enter"
                }
            ],
            callback: async () => {
                await this.viewBlogInObsidian();
            }
        });
    }

    private async viewBlogInObsidian() {

        setTimeout(() => {
            setTabs();
            setHidden();
        }, 500);

        const openMdFile = this.plugin.app.workspace.getActiveFile();

        if (!openMdFile) return new Notice("No active file open");
        if (!openMdFile.path.includes(this.settings.blogFolder)) return new Notice("This command only works in the blog folder");
        if (openMdFile.path.includes("~temp")) return new Notice("You can't use this command in the preview folder");

        await this.markdownRenderer.renderMarkdown(openMdFile.path, this.plugin.app.vault.adapter);
        await this.plugin.app.vault.adapter.exists(openMdFile.path);
        const previewFilePath = path.join(this.settings.blogFolder, "~temp", `Preview ${openMdFile.name}`).replace(/\\/g, '/');
        const file = this.plugin.app.vault.getAbstractFileByPath(previewFilePath) as TFile;

        if (!file) return new Notice("Preview file not found");
        if (file.basename === split_filename) return;

        split_filename = file.basename;

        const leaves = this.plugin.app.workspace.getLeavesOfType('markdown');
        const currentActiveLeaf = this.plugin.app.workspace.getMostRecentLeaf();

        if (!currentActiveLeaf) return new Notice("No active leaf found");
        for (const leaf of leaves) if (leaf !== currentActiveLeaf) leaf.detach();
        await currentActiveLeaf.openFile(openMdFile, { state: { mode: 'source' } });
        const newLeaf = this.plugin.app.workspace.getLeaf('split', 'vertical');
        await newLeaf.openFile(file, { state: { mode: 'preview', active: false, focus: false } });
        this.plugin.app.workspace.setActiveLeaf(currentActiveLeaf, { focus: true });

    }

    async handleEditorChange(autoUpdate: boolean, autoSync: boolean) {
        const openMdFile = this.plugin.app.workspace.getActiveFile();
        if (!openMdFile?.path.includes(this.settings.blogFolder)) return;
        if (openMdFile.path.includes("~temp")) return new Notice("You can't use this command in the preview folder");
        if (autoUpdate) {
            if (!openMdFile) return new Notice("No active file open");
            await this.markdownRenderer.renderMarkdown(openMdFile.path, this.plugin.app.vault.adapter);
            setTimeout(() => {
                setTabs();
                setHidden();
            }, 500);
        }

        if (autoSync) await this.apiClient.quickSync();
    }
}
