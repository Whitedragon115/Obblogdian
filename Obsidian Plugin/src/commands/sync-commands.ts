import { Notice } from "obsidian";
import { BaseCommand } from "./base-command";

export class SyncCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "sync-blog",
            name: "Sync Blog",
            callback: async () => {
                await this.syncBlog();
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

    private async syncBlog() {
        try {
            await this.apiClient.sync();
        } catch (error) {
            console.error("Sync failed:", error);
        }
    }

    private async toggleAutoSync() {
        this.settings.autoSync = !this.settings.autoSync;
        await this.saveSettings();
        new Notice(`Auto Sync is ${this.settings.autoSync ? "enabled" : "disabled"}`);
    }
}
