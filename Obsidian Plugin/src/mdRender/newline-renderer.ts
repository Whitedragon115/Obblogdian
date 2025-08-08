import { BaseRenderer } from "./base-renderer";

export class NewLineRenderer extends BaseRenderer {
    render(content: string): string {
        return content.replace(/^\\n(.*)/gm, (_m, text) => `<br>${text}`);
    }
}
