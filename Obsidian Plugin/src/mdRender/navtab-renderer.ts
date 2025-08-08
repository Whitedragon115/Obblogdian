import { BaseRenderer } from "./base-renderer";

export class NavTabRenderer extends BaseRenderer {
    render(content: string, recursion: boolean): string {
        if (!recursion) return content;

        return this.navtabv2(content, null, recursion);
    }

    private navtabv2(content: string, hexo: any, recursion: boolean): string {
        const TABS_BLOCK_REGEX = /^\[\[(.*?)\]\]([\s\S]*?)\[\[end\]\]$/gm;
        const TAB_BLOCK_REGEX = /^\[(.*?)\]\n([\s\S]*?)(?=^\[(?:.+)\]$|\u200B$)/gm;

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

        const buildTabNavAndContent = (matches: string[], tabName: string, tabActive: number): { tabNav: string; tabContent: string } => {
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
                const renderedContent: string = this.markdownIt.render(matches[i + 1]).trim();
                const isActive: string = (tabActive > 0 && tabActive === i / 2 + 1) || (tabActive === 0 && i === 0)
                    ? " active"
                    : "";
                tabNav += `<li class="tab${isActive}"><a class="#${tabHref}">${tabIcon + tabCaption.trim()}</a></li>`;
                tabContent += `<div class="tab-pane${isActive}" id="${tabHref}">\n${renderedContent}\n</div>`;
            }
            return { tabNav, tabContent };
        };

        const finalTabNav = content.replace(
            TABS_BLOCK_REGEX,
            (_m: string, tabsId: string, tabsContent: string): string => {
                const [tabName, tabActiveStr] = parseArgs(tabsId.split(" "));
                const activeTabIndex: number = Number(tabActiveStr) || 0;
                if (!tabName) console.warn("Tabs block must have unique name!");
                const matches: string[] = extractMatches(tabsContent);
                const { tabNav, tabContent } = buildTabNavAndContent(matches, tabName, activeTabIndex);
                const finalTabNavHtml: string = `<ul class="nav-tabs">${tabNav}</ul>`;
                const finalTabContent: string = `<div class="tab-content">${tabContent}</div>`;
                return `<div class="tabs" id="tab-${tabName.toLowerCase().split(" ").join("-")}">${finalTabNavHtml}${finalTabContent}</div>\n`;
            }
        );

        return finalTabNav;
    }
}