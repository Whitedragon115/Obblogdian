import { Setting } from "obsidian";
import { BaseSetting } from "./base-setting";

export class AutomationSettings extends BaseSetting {
    render(containerEl: HTMLElement): void {

        new Setting(containerEl)
            .setName('Auto Update')
            .setDesc('Automatically render markdown files when they change')
            .addToggle(toggle => toggle
                .setValue(this.tempSettings.autoUpdate)
                .onChange(async (value) => {
                    this.tempSettings.autoUpdate = value;
                    this.markUnsavedChanges();
                }));

        new Setting(containerEl)
            .setName('Auto Sync')
            .setDesc('Automatically sync files to server when they change')
            .addToggle(toggle => toggle
                .setValue(this.tempSettings.autoSync)
                .onChange(async (value) => {
                    this.tempSettings.autoSync = value;
                    this.markUnsavedChanges();
                }));
    }
}
