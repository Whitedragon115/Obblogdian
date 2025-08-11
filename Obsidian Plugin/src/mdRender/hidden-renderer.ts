import { BaseRenderer } from "./base-renderer";

export class HiddenRenderer extends BaseRenderer {
    render(content: string): string {
        return content.replace(/\|\|(.+?)\|\|/gm, (_m, text) => {
            return `<span class="hidden-text-container"><span class="hidden-text">${text}</span><span class="hidden-box"></span></span>`;
        });
    }
}