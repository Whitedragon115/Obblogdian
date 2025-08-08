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
        }, 2000);

        this.registerDomEvent(window, 'beforeunload', () => {
            this.cleanTempFiles();
        });
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
        try {
            if (!this.settings.blogFolder) {
                console.log("Blog folder not set, skipping temp file cleanup");
                return;
            }

            const tempFolderPath = `${this.settings.blogFolder}/~temp`;
            console.log(`Cleaning temp files in: ${tempFolderPath}`);
            
            const tempFiles = this.app.vault.getFiles().filter(file => 
                file.path.includes('/~temp/') || file.path.includes('\\~temp\\')
            );
            
            if (tempFiles.length > 0) {
                tempFiles.forEach(async (file) => {
                    try {
                        await this.app.vault.trash(file, true);
                        console.log(`Cleaned temp file: ${file.path}`);
                    } catch (error) {
                        console.error(`Failed to clean temp file ${file.path}:`, error);
                    }
                });
                
                const notice = new Notice(`Cleaned ${tempFiles.length} temporary files`);
                setTimeout(() => notice.hide(), 2000);
            }
        } catch (error) {
            console.error("Error during temp file cleanup:", error);
        }
    }
}
