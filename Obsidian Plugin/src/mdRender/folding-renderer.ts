import { BaseRenderer } from "./base-renderer";

export class FoldingRenderer extends BaseRenderer {
    render(content: string, recursion: boolean, renderers?: (content: string) => string): string {
        if (!recursion) return content;

        return this.foldingv2(content, null, recursion);
    }

    private foldingv2(context: string, hexo: any, recursion: boolean): string {

        const topRegex = /^>\[(info|note|danger|success|warn|df)\]\s(.+)$/gm;
        const downRegex = /^<<<$/gm;

        context = context.replace(topRegex, (match, type, title) => {
            const table = [
                { type: 'info', color: 'blue' },
                { type: 'note', color: 'gray' },
                { type: 'danger', color: 'red' },
                { type: 'success', color: 'green' },
                { type: 'warn', color: 'yellow' },
                { type: 'df', color: 'white' }
            ];

            title = title.trim();
            const colorClass = table.find(arr => arr.type === type)?.color || 'white';
            const res = `<details class="${colorClass}" data-header-exclude><summary><i class="fa-solid fa-chevron-right"></i>${title}</summary><div class='content'>\n`;
            return res;
        });

        context = context.replace(downRegex, (match) => {
            const res = `</div></details>`;
            return res;
        });

        return context;
    }
}