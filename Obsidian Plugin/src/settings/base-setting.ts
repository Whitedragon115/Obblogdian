import { App } from "obsidian";
import MyPlugin from "../main";
import { MyPluginSettings } from "./types";

export abstract class BaseSetting {
    protected app: App;
    protected plugin: MyPlugin;
    protected tempSettings: MyPluginSettings;
    protected markUnsavedChanges: () => void;
    protected hasUnsavedChanges: boolean;

    constructor(
        app: App,
        plugin: MyPlugin,
        tempSettings: MyPluginSettings,
        markUnsavedChanges: () => void,
        hasUnsavedChanges?: boolean
    ) {
        this.app = app;
        this.plugin = plugin;
        this.tempSettings = tempSettings;
        this.markUnsavedChanges = markUnsavedChanges;
        this.hasUnsavedChanges = hasUnsavedChanges || false;
    }

    abstract render(containerEl: HTMLElement): void;

    public setHasUnsavedChanges(value: boolean): void {
        this.hasUnsavedChanges = value;
    }
}
