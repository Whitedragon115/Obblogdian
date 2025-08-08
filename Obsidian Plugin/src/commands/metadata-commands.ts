import { Notice } from "obsidian";
import { BaseCommand } from "./base-command";

export class MetadataCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "meta-create",
            name: "Create Meta Data",
            callback: async () => {
                await this.createMetadata();
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
}
