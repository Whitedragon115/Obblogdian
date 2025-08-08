import MarkdownIt from "markdown-it";
import { MetadataRenderer } from "./metadata-renderer";
import { AdmonitionRenderer } from "./admonition-renderer";
import { ButtonRenderer } from "./button-renderer";
import { CheckboxRenderer } from "./checkbox-renderer";
import { FoldingRenderer } from "./folding-renderer";
import { HiddenRenderer } from "./hidden-renderer";
import { ItalicRenderer } from "./italic-renderer";
import { NavTabRenderer } from "./navtab-renderer";
import { NewLineRenderer } from "./newline-renderer";
import { SubtextRenderer } from "./subtext-renderer";
import { UnderlineRenderer } from "./underline-renderer";

export class RenderManager {
    private readonly markdownIt: MarkdownIt;
    private readonly metadataRenderer: MetadataRenderer;
    private readonly admonitionRenderer: AdmonitionRenderer;
    private readonly buttonRenderer: ButtonRenderer;
    private readonly checkboxRenderer: CheckboxRenderer;
    private readonly foldingRenderer: FoldingRenderer;
    private readonly hiddenRenderer: HiddenRenderer;
    private readonly italicRenderer: ItalicRenderer;
    private readonly navTabRenderer: NavTabRenderer;
    private readonly newLineRenderer: NewLineRenderer;
    private readonly subtextRenderer: SubtextRenderer;
    private readonly underlineRenderer: UnderlineRenderer;

    constructor(markdownIt: MarkdownIt) {
        this.markdownIt = markdownIt;
        this.metadataRenderer = new MetadataRenderer(markdownIt);
        this.admonitionRenderer = new AdmonitionRenderer(markdownIt);
        this.buttonRenderer = new ButtonRenderer(markdownIt);
        this.checkboxRenderer = new CheckboxRenderer(markdownIt);
        this.foldingRenderer = new FoldingRenderer(markdownIt);
        this.hiddenRenderer = new HiddenRenderer(markdownIt);
        this.italicRenderer = new ItalicRenderer(markdownIt);
        this.navTabRenderer = new NavTabRenderer(markdownIt);
        this.newLineRenderer = new NewLineRenderer(markdownIt);
        this.subtextRenderer = new SubtextRenderer(markdownIt);
        this.underlineRenderer = new UnderlineRenderer(markdownIt);
    }

    applyMetadata(content: string): string {
        return this.metadataRenderer.render(content);
    }

    applyAdmonition(content: string, recursion: boolean, renderers?: (content: string) => string): string {
        return this.admonitionRenderer.render(content, recursion, renderers);
    }

    applyButton(content: string): string {
        return this.buttonRenderer.render(content);
    }

    applyCheckbox(content: string): string {
        return this.checkboxRenderer.render(content);
    }

    applyFolding(content: string, recursion: boolean, renderers?: (content: string) => string): string {
        return this.foldingRenderer.render(content, recursion, renderers);
    }

    applyHidden(content: string): string {
        return this.hiddenRenderer.render(content);
    }

    applyItalic(content: string): string {
        return this.italicRenderer.render(content);
    }

    applyNavTab(content: string, recursion: boolean): string {
        return this.navTabRenderer.render(content, recursion);
    }

    applyNewLine(content: string): string {
        return this.newLineRenderer.render(content);
    }

    applySubtext(content: string): string {
        return this.subtextRenderer.render(content);
    }

    applyUnderline(content: string): string {
        return this.underlineRenderer.render(content);
    }
}
