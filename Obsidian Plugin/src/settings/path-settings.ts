import { Setting } from "obsidian";
import { BaseSetting } from "./base-setting";

export class PathSettings extends BaseSetting {
    render(containerEl: HTMLElement): void {
        
        new Setting(containerEl)
            .setName('Blogging Area')
            .setDesc('Enter the name of your blogging area')
            .addText(text => text
                .setPlaceholder('Enter the name of your blogging area')
                .setValue(this.tempSettings.blogFolder)
                .onChange(async (value) => {
                    this.tempSettings.blogFolder = value;
                    this.markUnsavedChanges();
                }));
    }
}
