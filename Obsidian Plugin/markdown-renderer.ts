import MarkdownIt from "markdown-it";
import * as fs from "fs";
import * as path from "path";

export class MarkdownRenderer {
    private markdownIt: MarkdownIt;

    constructor() {
        this.markdownIt = new MarkdownIt({ html: true, breaks: true });
    }

    async renderMarkdown(filePath: string, vaultAdapter: any) {
        try {
            let fileContent = await vaultAdapter.read(filePath);
            fileContent = this.renderCustom(fileContent);
            fileContent = this.markdownIt.render(fileContent);
            fileContent = this.codeblockFix(fileContent);

            const basePath = vaultAdapter.getBasePath();
            // 將檔案位於 Write Area 的路徑，替換成 Preview Area，保留相對資料夾結構
            const previewFilePath = path.join(
                basePath,
                filePath.replace(/Write Area/gi, "Preview Area")
            );

            const parentDir = path.dirname(previewFilePath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(previewFilePath, fileContent, "utf-8");
        } catch (error) {
            console.error("Error processing Markdown file:", error);
        }
    }

    private codeblockFix(content: string): string {
        const regex = /<pre><code(\s.+?)?>(.*?)<\/code><\/pre>/g;
        return content.replace(regex, (_m, lang, inner) => {
            const replaced = lang
                ? inner.replace(/\n/gm, "\n<br>")
                : inner.replace(/\n/gm, "<br>");
            return `<pre><code${lang || ""}>${replaced}</code></pre>`;
        });
    }

    private renderers(content: string): string {
        const renderers = [
            this.applyButton,
            this.applyCheckbox,
            this.applyHidden,
            this.applyItalic,
            this.applyNewLine,
            this.applySubtext,
            this.applyUnderline,
        ];
        renderers.forEach((fn) => {
            content = fn.call(this, content);
        });

        content = this.secondLayerRender(content);

        return content;
    }

    private secondLayerRender(content: string): string {
        const admontionRegex = /:::\((info|note|danger|success|warn|warning)\)\[(.*?)\]\n([\s\S]*?)\n\s*:::/gm;
        const foldingRegex = /^>\[(info|note|danger|success|warn|df)\]\s(.+)\n([\s\S]*?)\n^<<<$/gm;
        const tabRegex = /\[\[(.*?)\]\]([\s\S]*?)\[\[end\]\]/gm;

        const recursionAdmontion = Boolean(content.match(admontionRegex));
        const recursionFolding = Boolean(content.match(foldingRegex));
        const recursionTab = Boolean(content.match(tabRegex));

        content = this.applyAdmonition(content, recursionAdmontion);
        content = this.applyFolding(content, recursionFolding);
        content = this.applyNavTab(content, recursionTab);

        const allRecursion = recursionAdmontion || recursionFolding || recursionTab;

        if (allRecursion) {
            return this.secondLayerRender(content);
        }

        return content;
    }

    private renderCustom(content: string): string {
        content = this.applyMetadata(content);

        const codeBlocks: string[] = [];
        content = content.replace(/```([\s\S]*?)```/g, (match) => {
            codeBlocks.push(match);
            return "\uE000CODEBLOCK_PLACEHOLDER\uE000";
        });

        const insideContentRenderers = [
            this.applyNavTab,
            this.applyFolding,
            this.applyAdmonition,
        ];

        insideContentRenderers.forEach((fn) => {
            content = fn.call(this, content);
        });

        content = this.renderers(content);

        content = content.replace(
            /\uE000CODEBLOCK_PLACEHOLDER\uE000/g,
            () => this.markdownIt.render(codeBlocks.shift() || "")
        );
        return content;
    }

    private applyMetadata(content: string): string {
        const metaRegex = /^---\n([\s\S]+?)\n---\n/;
        const metaExecResult = metaRegex.exec(content);
        if (metaExecResult) {
            const metaContent = metaExecResult[1];
            const lines = metaContent.split('\n').filter(line => line.trim().length > 0);
            let htmlContent = `<div class="metadata-container" style="margin-bottom: 2em;">`;
            lines.forEach(line => {
                const parts = line.split(/:(.+)/);
                if (parts.length >= 3) {
                    const key = parts[0].trim();
                    const value = parts[1].trim();
                    htmlContent += `
                        <div class="metadata-item">
                            <div class="metadata-key">${key}</div>
                            <div class="metadata-value">${value}</div>
                        </div>`;
                }
            });
            htmlContent += `</div>\n`;
            content = content.replace(metaRegex, '');
            content = htmlContent + content;
        }
        return content;
    }

    private applyAdmonition(content: string, recursion: boolean): string {
        if (!recursion) return content;

        const regex = /:::\((info|note|danger|success|warn|warning)\)\[(.*?)\]\n([\s\S]*?)\n\s*:::/gm;
        const cfg: Record<string, string> = {
            info: "其他資訊",
            note: "小提示",
            danger: "注意警告",
            success: "相關資訊",
            warn: "特別注意",
            warning: "注意事項",
        };
        return content.replace(regex, (_m, type, title, body) => {
            title = title.trim() || cfg[type];
            return `<div class="admonition ${type}"><p class="admonition-title">${title}</p><div>${this.markdownIt.render(
                this.renderers(body)
            )}</div></div>`;
        });
    }

    private applyButton(content: string): string {
        return content.replace(/\[{(.+)}\]/gm, (_m, p1) => {
            const [text, url] = p1.split(",").map((e: string) => e.trim());
            return `<a class="button" href="${url || "#"}">${text}</a>`;
        });
    }

    private applyCheckbox(content: string): string {
        const regex = /-\s\[(\s|x|-|_)\]\s(.+?)(\||$)(.+)?/gm;
        const icons: Record<string, string> = {
            "x": `❌ <a style="color:var(--default-text-color); text-decoration: none;">`,
            " ": `✅ <a style="color:var(--default-text-color); text-decoration: none;">`,
            "-": `🟨 <a style="color: #bac238; text-decoration: none;">`,
            "_": `🟦 <a style="color: #5c8aff; text-decoration: none;">`,
        };
        return content.replace(regex, (_m, check, text, _d, slogan) => {
            const icon = icons[check] || icons[" "];
            const sloganText = slogan ? ` <a style="color:gray; text-decoration: none;">${slogan}</a>` : "";
            return `${icon} ${text}</a>${sloganText}`;
        });
    }

    private applyFolding(content: string, recursion: boolean): string {
        if (!recursion) return content;

        const regex = /^>\[(info|note|danger|success|warn|df)\]\s(.+)\n([\s\S]*?)\n^<<<$/gm;
        const colors: Record<string, string> = {
            info: "blue",
            note: "gray",
            danger: "red",
            success: "green",
            warn: "orange",
            df: "white",
        };
        content = content.replace(regex, (_m, type, title, body) => {
            return `<details class="${colors[type]}"><summary><i class="fa-solid fa-chevron-right"></i>${title}</summary><div class='content'>${this.markdownIt.render(this.renderers(body))}</div></details>`;
        });
        return content;
    }

    private applyHidden(content: string): string {
        return content.replace(/\|\|(.+?)\|\|/gm, (_m, text) => {
            return `<span class="hidden-text-container"><span class="hidden-text">${text}</span><span class="hidden-box"></span></span>`;
        });
    }

    private applyItalic(content: string): string {
        return content.replace(/\\(.+?)\\/g, (_m, text) => `<em>${text}</em>`);
    }

    private applyNavTab(content: string, recursion: boolean): string {
        if (!recursion) return content;

        const TABS_BLOCK_REGEX: RegExp = /\[\[(.*?)\]\]([\s\S]*?)\[\[end\]\]/gm;
        const TAB_BLOCK_REGEX: RegExp = /^\[(.*?)\]\n([\s\S]*?)(?=^\[(?:.+)\]$|\u200B$)/gm;

        const parseArgs = (args: string[]): string[] => {
            return args.join(" ").includes("::")
                ? args.join(" ").split("::")
                : args.join(" ").split(",");
        };

        const extractMatches = (content: string): string[] => {
            const matches: string[] = [];
            let match: RegExpExecArray | null;
            content += "\u200B";
            while ((match = TAB_BLOCK_REGEX.exec(content)) !== null) {
                matches.push(match[1]);
                matches.push(match[2]);
            }
            return matches;
        };

        const buildTabNavAndContent = (
            matches: string[],
            tabName: string,
            tabActive: number
        ): { tabNav: string; tabContent: string } => {
            let tabNav = "";
            let tabContent = "";
            for (let i = 0; i < matches.length; i += 2) {
                const tabParameters: string[] = matches[i].split("@");
                const tabCaption: string = tabParameters[0] || "";
                const tabIcon: string = tabParameters[1] || "";
                const tabHref: string = (tabName + " " + (i / 2 + 1))
                    .toLowerCase()
                    .split(" ")
                    .join("-");
                const renderedContent: string = this.markdownIt
                    .render(matches[i + 1])
                    .trim();
                const isActive: string =
                    (tabActive > 0 && tabActive === i / 2 + 1) ||
                        (tabActive === 0 && i === 0)
                        ? " active"
                        : "";
                tabNav += `<li class="tab${isActive}"><a class="#${tabHref}">${tabIcon + tabCaption.trim()}</a></li>`;
                tabContent += `<div class="tab-pane${isActive}" id="${tabHref}">${renderedContent}</div>`;
            }
            return { tabNav, tabContent };
        };

        return content.replace(
            TABS_BLOCK_REGEX,
            (_m: string, tabsId: string, tabsContent: string): string => {
                const [tabName, tabActiveStr] = parseArgs(tabsId.split(" "));
                const activeTabIndex: number = Number(tabActiveStr) || 0;
                if (!tabName) console.warn("Tabs block must have unique name!");
                const matches: string[] = extractMatches(tabsContent);
                const { tabNav, tabContent } = buildTabNavAndContent(
                    matches,
                    tabName,
                    activeTabIndex
                );
                const finalTabNav: string = `<ul class="nav-tabs">${tabNav}</ul>`;

                let finalcontent = this.markdownIt.render(tabContent).replace(/<br>/g, '\n');
                finalcontent = finalcontent.replace('\uE000CODEBLOCK_PLACEHOLDER\uE000', '\n\uE000CODEBLOCK_PLACEHOLDER\uE000\n');

                const finalTabContent: string = `<div class="tab-content">${finalcontent}</div>`;
                return `<div class="tabs" id="tab-${tabName
                    .toLowerCase()
                    .split(" ")
                    .join("-")}">${finalTabNav}${finalTabContent}</div>`;
            }
        );
    }

    private applyNewLine(content: string): string {
        return content.replace(/^\\n(.*)/gm, (_m, text) => `<br>${text}`);
    }

    private applySubtext(content: string): string {
        return content.replace(/-#\s*(.+)$/gm, (_m, text) => `<small class="comment">${text}</small>`);
    }

    private applyUnderline(content: string): string {
        return content.replace(/__(.+?)__/g, (_m, text) => `<u>${text}</u>`);
    }
}
