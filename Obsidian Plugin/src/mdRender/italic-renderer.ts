import { BaseRenderer } from "./base-renderer";

export class ItalicRenderer extends BaseRenderer {
    render(content: string): string {
        return content.replace(/\\(.+?)\\/g, (_m, text) => `<em>${text}</em>`);
    }
}
