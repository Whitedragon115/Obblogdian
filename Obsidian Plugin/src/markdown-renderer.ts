import MarkdownIt from "markdown-it";
import * as fs from "fs";
import * as path from "path";
import { RenderManager } from "./mdRender";
import { MyPluginSettings } from "./settings/types";
import { Notice } from "obsidian";

export class MarkdownRenderer {
    private readonly markdownIt: MarkdownIt;
    private readonly renderManager: RenderManager;
    private readonly settings: MyPluginSettings;

    constructor(settings: MyPluginSettings) {
        this.markdownIt = new MarkdownIt({ html: true, breaks: true });
        this.renderManager = new RenderManager(this.markdownIt);
        this.settings = settings;
    }

    async renderMarkdown(filePath: string, vaultAdapter: any) {
        if (!this.settings.blogFolder) new Notice("Blog folder is not set in settings.\nconsider reload your obsidian.");

        let fileContent = await vaultAdapter.read(filePath);
        fileContent = this.renderMd(fileContent);
        fileContent = this.markdownIt.render(fileContent);
        fileContent = this.codeblockFix(fileContent);

        const fileName = path.basename(filePath, path.extname(filePath));
        const previewFilePath = path.join(
            vaultAdapter.getBasePath(),
            this.settings.blogFolder,
            "~temp",
            `Preview ${fileName}.md`
        );

        const parentDir = path.dirname(previewFilePath);
        if (!fs.existsSync(parentDir)) await fs.promises.mkdir(parentDir, { recursive: true });

        await fs.promises.writeFile(previewFilePath, fileContent, "utf-8");
        await fs.promises.access(previewFilePath, fs.constants.F_OK);

        console.log("Markdown rendering completed successfully");
    }

    private renderMd(content: string): string {

        const codeBlocks: string[] = [];
        content = content.replace(/```([\s\S]*?)```/g, (match) => {
            codeBlocks.push(match);
            return "\uE000CODEBLOCK_PLACEHOLDER\uE000";
        });

        content = this.renderManager.applyMetadata(content);

        content = this.renderManager.applyAdmonition(content, true);
        content = this.renderManager.applyNavTab(content, true);
        content = this.renderManager.applyFolding(content, true);

        content = this.renderManager.applyButton(content);
        content = this.renderManager.applyCheckbox(content);
        content = this.renderManager.applyHidden(content);
        content = this.renderManager.applyItalic(content);
        content = this.renderManager.applyNewLine(content);
        content = this.renderManager.applySubtext(content);
        content = this.renderManager.applyUnderline(content);

        content = content.replace(
            /\uE000CODEBLOCK_PLACEHOLDER\uE000/g,
            () => codeBlocks.shift() || ""
        );

        return content;
    }

    private codeblockFix(content: string): string {
        const regex = /<pre><code(\s[^>]*?)?>([\s\S]*?)<\/code><\/pre>/g;
        return content.replace(regex, (_m, lang, inner) => {
            const replaced = lang
                ? inner.replace(/\n/gm, "\n<br>")
                : inner.replace(/\n/gm, "<br>");
            return `<pre><code${lang || ""}>${replaced}</code></pre>`;
        });
    }
}