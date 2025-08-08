import { BaseRenderer } from "./base-renderer";

export class MetadataRenderer extends BaseRenderer {
    render(content: string): string {
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
}
