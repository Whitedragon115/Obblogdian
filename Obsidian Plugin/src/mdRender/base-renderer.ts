import MarkdownIt from "markdown-it";

export abstract class BaseRenderer {
    protected markdownIt: MarkdownIt;

    constructor(markdownIt: MarkdownIt) {
        this.markdownIt = markdownIt;
    }

    abstract render(content: string, ...args: any[]): string;
}
