import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";
import { MyPluginSettings } from "./settings/types";
import { SettingsManager } from "./settings/settings-manager";

export type { MyPluginSettings } from "./settings/types";
export { DEFAULT_SETTINGS } from "./settings/types";

export class MyPluginSettingTab extends PluginSettingTab {
    plugin: MyPlugin;
    private readonly tempSettings: MyPluginSettings;
    private hasUnsavedChanges: boolean = false;
    private readonly settingsManager: SettingsManager;
    private readonly hasUnsavedChangesRef: { value: boolean };

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.tempSettings = { ...plugin.settings };
        this.hasUnsavedChangesRef = { value: false };

        this.settingsManager = new SettingsManager(
            app,
            plugin,
            this.tempSettings,
            () => this.markUnsavedChanges(),
            this.hasUnsavedChangesRef
        );

        this.settingsManager.setControlCallbacks(
            () => {
                this.hasUnsavedChanges = false;
                this.hasUnsavedChangesRef.value = false;
            },
            () => {
                this.hasUnsavedChanges = false;
                this.hasUnsavedChangesRef.value = false;
                this.display();
            }
        );
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl).setName('Obblogdian Settings').setHeading();
        this.settingsManager.renderAll(containerEl);
    }

    private markUnsavedChanges(): void {
        this.hasUnsavedChanges = true;
        this.hasUnsavedChangesRef.value = true;
        this.settingsManager.updateHasUnsavedChanges(true);
    }

    hide(): void {
        if (this.hasUnsavedChanges) {
            const shouldContinue = confirm('You have unsaved changes. Are you sure you want to close without saving?');
            if (!shouldContinue) {
                return;
            }
        }
        super.hide();
    }
}
