import { Setting, Notice } from "obsidian";
import { BaseSetting } from "./base-setting";

export class ControlSettings extends BaseSetting {
    constructor(
        app: any,
        plugin: any,
        tempSettings: any,
        markUnsavedChanges: () => void,
        hasUnsavedChanges: boolean
    ) {
        super(app, plugin, tempSettings, markUnsavedChanges, hasUnsavedChanges);
    }

    render(containerEl: HTMLElement): void {

        containerEl.createEl('hr');

        const buttonContainer = containerEl.createEl('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginBottom = '20px';

        new Setting(buttonContainer)
            .addButton(button => button
                .setButtonText('Save Settings')
                .setCta()
                .onClick(async () => {
                    await this.saveAllSettings();
                }))
            .addButton(button => button
                .setButtonText('Reset to Saved')
                .setWarning()
                .onClick(async () => {
                    await this.resetToSaved();
                }));
    }

    private async saveAllSettings(): Promise<Notice | void> {
        try {

            if (this.tempSettings.blogFolder) {
                const vault = this.app.vault;
                const folderExists = vault.getAbstractFileByPath(this.tempSettings.blogFolder);
                if (!folderExists) {
                    await vault.createFolder(this.tempSettings.blogFolder);
                }
            }

            this.plugin.settings = { ...this.tempSettings };
            await this.plugin.saveSettings();            
            this.setHasUnsavedChanges(false);
            new Notice('Settings saved successfully!', 3000);
            this.onSettingsSaved();

        } catch (error) {
            console.error('Failed to save settings:', error);
            return new Notice('Failed to save settings. Please try again.', 5000);
        }
    }

    private async resetToSaved(): Promise<Notice | void> {
        
        Object.assign(this.tempSettings, this.plugin.settings);
        this.setHasUnsavedChanges(false);
        this.onSettingsReset();
        
        return new Notice('Settings reset to last saved values.', 3000);
    }


    private onSettingsSaved(): void {

    }

    private onSettingsReset(): void {

    }

    setCallbacks(onSaved: () => void, onReset: () => void): void {
        this.onSettingsSaved = onSaved;
        this.onSettingsReset = onReset;
    }
}
