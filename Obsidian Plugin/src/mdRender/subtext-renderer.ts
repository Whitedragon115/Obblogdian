import { BaseRenderer } from "./base-renderer";

export class SubtextRenderer extends BaseRenderer {
    render(content: string): string {
        return content.replace(/-#\s*(.+)$/gm, (_m, text) => `<small class="comment">${text}</small>`);
    }
}
