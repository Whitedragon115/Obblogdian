import { Plugin } from "obsidian";
import { MyPluginSettings } from "../settings";
import { MetadataCommands } from "./metadata-commands";
import { ServerCommands } from "./server-commands";
import { SyncCommands } from "./sync-commands";
import { RenderCommands } from "./render-commands";
import { ViewCommands } from "./view-commands";
import { ApiClient } from "../api-client";

export class CommandManager {
    private readonly metadataCommands: MetadataCommands;
    private readonly serverCommands: ServerCommands;
    private readonly syncCommands: SyncCommands;
    private readonly renderCommands: RenderCommands;
    private readonly viewCommands: ViewCommands;
    private readonly apiClient: ApiClient;

    constructor(
        private readonly plugin: Plugin,
        private readonly settings: MyPluginSettings,
        private readonly saveSettings: () => Promise<void>
    ) {
        this.metadataCommands = new MetadataCommands(plugin, settings, saveSettings);
        this.serverCommands = new ServerCommands(plugin, settings, saveSettings);
        this.syncCommands = new SyncCommands(plugin, settings, saveSettings);
        this.renderCommands = new RenderCommands(plugin, settings, saveSettings);
        this.viewCommands = new ViewCommands(plugin, settings, saveSettings);
        this.apiClient = new ApiClient(settings);
    }

    registerCommands() {
        this.metadataCommands.registerCommands();
        this.serverCommands.registerCommands();
        this.syncCommands.registerCommands();
        this.renderCommands.registerCommands();
        this.viewCommands.registerCommands();
    }

    async handleEditorChange() {
        await this.viewCommands.handleEditorChange(this.settings.autoUpdate, this.settings.autoSync);
    }
}
