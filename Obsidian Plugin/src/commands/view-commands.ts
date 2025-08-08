import { Notice, TFile } from "obsidian";
import * as path from "path";
import { BaseCommand } from "./base-command";
import { setTabs, setHidden } from "../utils";

let split_filename = "";

export class ViewCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "view-blog-obsidian",
            name: "View Blog in here",
            callback: async () => {
                await this.viewBlogInObsidian();
            }
        });
    }

    private async viewBlogInObsidian() {

        const openMdFile = this.plugin.app.workspace.getActiveFile();

        if (!openMdFile) return new Notice("No active file open");
        if (!openMdFile.path.includes(this.settings.blogFolder)) return new Notice("This command only works in the blog folder");
        if (openMdFile.path.includes("~temp")) return new Notice("You can't use this command in the preview folder");

        await this.markdownRenderer.renderMarkdown(openMdFile.path, this.plugin.app.vault.adapter);

        setTabs();
        setHidden();

        const previewFilePath = path.join(this.settings.blogFolder, "~temp", `Preview ${openMdFile.name}`).replace(/\\/g, '/');
        let file = this.plugin.app.vault.getAbstractFileByPath(previewFilePath) as TFile;

        if (this.settings.autoUpdate && !file) {
            await this.handleEditorChange(true, false);
            this.viewBlogInObsidian();
        }
        if (!file) return new Notice("Preview file not found");
        if (file.basename === split_filename) return;

        split_filename = file.basename;

        const leaves = this.plugin.app.workspace.getLeavesOfType('markdown');
        const currentActiveLeaf = this.plugin.app.workspace.getMostRecentLeaf();

        for (const leaf of leaves) {
            if (leaf !== currentActiveLeaf) leaf.detach();
        }

        if (currentActiveLeaf) await currentActiveLeaf.openFile(openMdFile, { state: { mode: 'source' } });
        const newLeaf = this.plugin.app.workspace.getLeaf('split', 'vertical');
        await newLeaf.openFile(file, { state: { mode: 'preview', active: false, focus: false } });
    }

    async handleEditorChange(autoUpdate: boolean, autoSync: boolean) {
        const openMdFile = this.plugin.app.workspace.getActiveFile();

        if (!openMdFile?.path.includes(this.settings.blogFolder)) return;
        if (openMdFile.path.includes("~temp")) return new Notice("You can't use this command in the preview folder");
        if (autoUpdate) {
            if (!openMdFile) return new Notice("No active file open");
            await this.markdownRenderer.renderMarkdown(openMdFile.path, this.plugin.app.vault.adapter);
            setTabs();
            setHidden();
        }

        if (autoSync) await this.apiClient.quickSync();
    }
}
