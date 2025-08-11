import { Notice, Plugin } from "obsidian";
import { MyPluginSettings, DEFAULT_SETTINGS, MyPluginSettingTab } from "./settings";
import { CommandManager } from "./commands";
import { debounce } from "./utils";

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    private commandManager: CommandManager;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new MyPluginSettingTab(this.app, this));

        this.commandManager = new CommandManager(this, this.settings, () => this.saveSettings());
        this.commandManager.registerCommands();

        this.registerEvent(
            this.app.workspace.on(
                'editor-change',
                debounce(async () => {
                    await this.commandManager.handleEditorChange();
                }, 3000)
            )
        );

        setTimeout(() => {
            this.cleanTempFiles();
        }, 500);
    }

    async loadSettings() {
        this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        this.cleanTempFiles();
    }

    private cleanTempFiles() {
        if (!this.settings.blogFolder) return new Notice("Blog folder is not set. Please set it in the plugin settings.");

        const tempFiles = this.app.vault.getFiles().filter(file =>
            file.path.includes('/~temp/') || file.path.includes('\\~temp\\')
        );

        if (!tempFiles.length) return;

        tempFiles.forEach(async (file) => {
            await this.app.vault.trash(file, true);
        });

        return new Notice(`Cleaned ${tempFiles.length} temporary files`, 3000);
    }
}
