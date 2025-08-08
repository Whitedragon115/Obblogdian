import { Plugin } from "obsidian";
import { MyPluginSettings } from "../settings";
import { ApiClient } from "../api-client";
import { MarkdownRenderer } from "../markdown-renderer";

export abstract class BaseCommand {
    protected apiClient: ApiClient;
    protected markdownRenderer: MarkdownRenderer;

    constructor(
        protected plugin: Plugin,
        protected settings: MyPluginSettings,
        protected saveSettings: () => Promise<void>
    ) {
        this.apiClient = new ApiClient(settings);
        this.markdownRenderer = new MarkdownRenderer(settings);
    }

    abstract registerCommands(): void;
}
