import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

export interface MyPluginSettings {
    apiToken: string;
    apiLink: string;
    autoUpdate: boolean;
    autoSync: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
    apiToken: '',
    apiLink: '',
    autoUpdate: true,
    autoSync: false
}

export class MyPluginSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // 標題
        containerEl.createEl('h2', { text: 'Obblogdian Settings' });

        // API Token 設定
        new Setting(containerEl)
            .setName('API Token')
            .setDesc('Enter your API token for blog synchronization')
            .addText(text => text
                .setPlaceholder('Enter your API token')
                .setValue(this.plugin.settings.apiToken)
                .onChange(async (value) => {
                    this.plugin.settings.apiToken = value;
                    await this.plugin.saveSettings();
                }));

        // API Link 設定
        new Setting(containerEl)
            .setName('API Link')
            .setDesc('Enter your API base URL')
            .addText(text => text
                .setPlaceholder('https://your-api-url.com')
                .setValue(this.plugin.settings.apiLink)
                .onChange(async (value) => {
                    this.plugin.settings.apiLink = value;
                    await this.plugin.saveSettings();
                }));

        // Auto Update 設定
        new Setting(containerEl)
            .setName('Auto Update')
            .setDesc('Automatically render markdown files when they change')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoUpdate)
                .onChange(async (value) => {
                    this.plugin.settings.autoUpdate = value;
                    await this.plugin.saveSettings();
                }));

        // Auto Sync 設定
        new Setting(containerEl)
            .setName('Auto Sync')
            .setDesc('Automatically sync files to server when they change')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoSync)
                .onChange(async (value) => {
                    this.plugin.settings.autoSync = value;
                    await this.plugin.saveSettings();
                }));

        // 添加分隔線
        containerEl.createEl('hr');

        // 說明文字
        const description = containerEl.createEl('div');
        description.createEl('h3', { text: 'How to use:' });
        description.createEl('p', { text: '1. Enter your API token and API link in the fields above.' });
        description.createEl('p', { text: '2. Toggle auto-update to automatically render markdown files.' });
        description.createEl('p', { text: '3. Toggle auto-sync to automatically sync changes to your server.' });
        description.createEl('p', { text: '4. Use the command palette to access plugin commands.' });
        
        // 版本資訊
        const versionInfo = containerEl.createEl('div');
        versionInfo.style.marginTop = '20px';
        versionInfo.style.padding = '10px';
        versionInfo.style.backgroundColor = 'var(--background-secondary)';
        versionInfo.style.borderRadius = '5px';
        versionInfo.createEl('small', { text: 'Obblogdian Plugin v1.0.1' });
    }
}
