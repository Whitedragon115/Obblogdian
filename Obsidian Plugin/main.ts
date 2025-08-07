import { Plugin } from "obsidian";
import { MyPluginSettings, DEFAULT_SETTINGS, MyPluginSettingTab } from "./settings";
import { CommandManager } from "./commands";
import { debounce } from "./utils";

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    private commandManager: CommandManager;

    async onload() {
        await this.loadSettings();

        // 添加設定頁籤
        this.addSettingTab(new MyPluginSettingTab(this.app, this));

        // 初始化命令管理器
        this.commandManager = new CommandManager(this, this.settings, () => this.saveSettings());
        
        // 註冊所有命令
        this.commandManager.registerCommands();

        // 註冊編輯器變更事件
        this.registerEvent(
            this.app.workspace.on(
                'editor-change',
                debounce(async () => {
                    await this.commandManager.handleEditorChange();
                }, 3000)
            )
        );
    }

    async loadSettings() {
        this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        // 清理資源
    }
}
