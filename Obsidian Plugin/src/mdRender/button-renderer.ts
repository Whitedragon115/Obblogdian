import { BaseRenderer } from "./base-renderer";

export class ButtonRenderer extends BaseRenderer {
    render(content: string): string {
        return content.replace(/\[{(.+)}\]/gm, (_m, p1) => {
            const [text, url] = p1.split(",").map((e: string) => e.trim());
            return `<a class="button" href="${url || "#"}">${text}</a>`;
        });
    }
}
