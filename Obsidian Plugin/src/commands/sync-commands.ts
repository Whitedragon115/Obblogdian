import { Notice } from "obsidian";
import { BaseCommand } from "./base-command";

export class SyncCommands extends BaseCommand {
    registerCommands() {
        this.plugin.addCommand({
            id: "sync-blog",
            name: "Sync blog to server",
            callback: async () => {
                await this.syncBlog();
            }
        });

        this.plugin.addCommand({
            id: "toogle-auto-sync",
            name: "Auto sync blog to Server",
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
        return new Notice(`Auto Sync is ${this.settings.autoSync ? "enabled" : "disabled"}`);
    }
}
