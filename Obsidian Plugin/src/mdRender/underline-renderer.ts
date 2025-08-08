import { BaseRenderer } from "./base-renderer";

export class UnderlineRenderer extends BaseRenderer {
    render(content: string): string {
        return content.replace(/__(.+?)__/g, (_m, text) => `<u>${text}</u>`);
    }
}
