import { BaseRenderer } from "./base-renderer";

export class CheckboxRenderer extends BaseRenderer {
    render(content: string): string {
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
}
