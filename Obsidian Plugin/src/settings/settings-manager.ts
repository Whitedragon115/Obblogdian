import { ApiSettings } from "./api-settings";
import { PathSettings } from "./path-settings";
import { AutomationSettings } from "./automation-settings";
import { ControlSettings } from "./control-settings";
import { InfoSettings } from "./info-settings";

export class SettingsManager {
    private apiSettings: ApiSettings;
    private pathSettings: PathSettings;
    private automationSettings: AutomationSettings;
    private controlSettings: ControlSettings;
    private infoSettings: InfoSettings;
    private hasUnsavedChangesRef: { value: boolean };

    constructor(
        app: any,
        plugin: any,
        tempSettings: any,
        markUnsavedChanges: () => void,
        hasUnsavedChangesRef: { value: boolean }
    ) {
        this.hasUnsavedChangesRef = hasUnsavedChangesRef;
        
        this.apiSettings = new ApiSettings(app, plugin, tempSettings, markUnsavedChanges, hasUnsavedChangesRef.value);
        this.pathSettings = new PathSettings(app, plugin, tempSettings, markUnsavedChanges, hasUnsavedChangesRef.value);
        this.automationSettings = new AutomationSettings(app, plugin, tempSettings, markUnsavedChanges, hasUnsavedChangesRef.value);
        this.controlSettings = new ControlSettings(app, plugin, tempSettings, markUnsavedChanges, hasUnsavedChangesRef.value);
        this.infoSettings = new InfoSettings(app, plugin, tempSettings, markUnsavedChanges, hasUnsavedChangesRef.value);
    }

    renderAll(containerEl: HTMLElement): void {
        this.apiSettings.render(containerEl);
        this.pathSettings.render(containerEl);
        this.automationSettings.render(containerEl);
        this.controlSettings.render(containerEl);
        this.infoSettings.render(containerEl);
    }

    setControlCallbacks(onSaved: () => void, onReset: () => void): void {
        this.controlSettings.setCallbacks(onSaved, onReset);
    }

    updateHasUnsavedChanges(value: boolean): void {
        this.hasUnsavedChangesRef.value = value;
        // Update all settings components
        this.apiSettings.setHasUnsavedChanges(value);
        this.pathSettings.setHasUnsavedChanges(value);
        this.automationSettings.setHasUnsavedChanges(value);
        this.controlSettings.setHasUnsavedChanges(value);
        this.infoSettings.setHasUnsavedChanges(value);
    }
}
