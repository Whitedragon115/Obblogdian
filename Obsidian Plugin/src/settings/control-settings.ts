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
        // 添加分隔線
        containerEl.createEl('hr');

        // 保存按鈕區域
        const buttonContainer = containerEl.createEl('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginBottom = '20px';

        // Save Settings Button
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

    private async saveAllSettings(): Promise<void> {
        try {
            // Validate blog folder and create if necessary
            if (this.tempSettings.blogFolder) {
                const vault = this.app.vault;
                const folderExists = vault.getAbstractFileByPath(this.tempSettings.blogFolder);
                if (!folderExists) {
                    await vault.createFolder(this.tempSettings.blogFolder);
                }
            }

            // Copy temporary settings to actual settings
            this.plugin.settings = { ...this.tempSettings };
            
            // Save to disk
            await this.plugin.saveSettings();
            
            this.setHasUnsavedChanges(false);
            new Notice('Settings saved successfully!', 3000);
            
            // Notify parent to update hasUnsavedChanges
            this.onSettingsSaved();
        } catch (error) {
            console.error('Failed to save settings:', error);
            new Notice('Failed to save settings. Please try again.', 5000);
        }
    }

    private async resetToSaved(): Promise<void> {
        // Reset temporary settings to current saved settings
        Object.assign(this.tempSettings, this.plugin.settings);
        this.setHasUnsavedChanges(false);
        
        new Notice('Settings reset to last saved values.', 3000);
        
        // Notify parent to refresh display
        this.onSettingsReset();
    }

    // These methods should be overridden by the parent
    private onSettingsSaved(): void {
        // This will be set by the parent class
    }

    private onSettingsReset(): void {
        // This will be set by the parent class
    }

    setCallbacks(onSaved: () => void, onReset: () => void): void {
        this.onSettingsSaved = onSaved;
        this.onSettingsReset = onReset;
    }
}
