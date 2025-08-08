import { BaseRenderer } from "./base-renderer";

export class AdmonitionRenderer extends BaseRenderer {
    render(content: string, recursion: boolean, renderers?: (content: string) => string): string {
        if (!recursion) return content;

        return this.admonitionv2(content, null, null);
    }

    private admonitionv2(context: string, hexo: any, unuse: any): string {

        const topRegex = /^:::\((info|note|danger|success|warn|warning)\)\[(.*?)\]$/gm;
        const downRegex = /^:::$/gm;

        const cfg = [
            { type: 'info', title: '其他資訊' },
            { type: 'note', title: '小提示' },
            { type: 'danger', title: '注意警告' },
            { type: 'success', title: '相關資訊' },
            { type: 'warn', title: '特別注意' },
            { type: 'warning', title: '注意事項' }
        ];

        context = context.replace(topRegex, (match, type, title) => {
            title = !title.trim() ? cfg.find(a => a.type === type)?.title || type : title;
            const res = `<div class="admonition ${type.replace('note', 'notes')}"><p class="admonition-title">${title}</p>\n`;
            return res;
        });

        context = context.replace(downRegex, (match) => {
            const res = `\n</div>`;
            return res;
        });

        return context;
    }
}
