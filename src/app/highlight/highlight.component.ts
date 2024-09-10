import {
  ApplicationRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Injector,
  Input,
  OnChanges,
  Renderer2
} from '@angular/core';
import {HighlightJS} from 'ngx-highlightjs';
import {CopyButtonComponent} from "../copy-button/copy-button.component";

@Directive({
  standalone: true,
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private highlightJS: HighlightJS,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngOnChanges() {
    this.highlightCodeBlocks();
  }

  private highlightCodeBlocks() {
    const codeBlocks = this.extractCodeBlocks(this.appHighlight);
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');

    codeBlocks.forEach(block => {
      const backgroundColor = block.isCode ? 'black' : '#444654';
      if (block.isCode) {
        const codeElement = this.renderer.createElement('code');
        if (block.language) {
          this.renderer.addClass(codeElement, block.language);
        }
        this.renderer.setProperty(codeElement, 'textContent', block.content);
        this.highlightJS.highlightElement(codeElement);
        const preElement = this.createBlockElement(codeElement, block.content, backgroundColor);
        this.renderer.appendChild(this.el.nativeElement, preElement);
      } else {
        const divElement = this.renderer.createElement('div');
        this.renderer.addClass(divElement, 'non-code-text');
        const textNode = this.renderer.createText(this.trimSingleQuotes(block.content));
        this.renderer.appendChild(divElement, textNode);
        const containerElement = this.createBlockElement(divElement, block.content, backgroundColor);
        this.renderer.appendChild(this.el.nativeElement, containerElement);
      }
    });
  }

  private extractCodeBlocks(text: string): { content: string, isCode: boolean, language?: string }[] {
    const CODE_BLOCK_PATTERN = /```(\w+)?\s*([\s\S]*?)\s*```/g;
    const parts: { content: string, isCode: boolean, language?: string }[] = [];
    let lastIndex = 0;
    let match;

    while (match = CODE_BLOCK_PATTERN.exec(text)) {
      if (match.index > lastIndex) {
        parts.push({ content: text.substring(lastIndex, match.index), isCode: false });
      }
      parts.push({ content: match[2], isCode: true, language: match[1] || 'plaintext' });
      lastIndex = CODE_BLOCK_PATTERN.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ content: text.substring(lastIndex), isCode: false });
    }

    return parts;
  }

  private createBlockElement(element: HTMLElement, textContent: string, backgroundColor: string): HTMLElement {
    const container = this.renderer.createElement('div');
    this.renderer.addClass(container, 'block-container');

    const componentFactory = this.resolver.resolveComponentFactory(CopyButtonComponent);
    const componentRef = componentFactory.create(this.injector);

    // Trim single quotes from textContent
    (componentRef.instance as CopyButtonComponent).textToCopy = this.trimSingleQuotes(textContent);
    (componentRef.instance as CopyButtonComponent).backgroundColor = backgroundColor;

    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

    this.renderer.appendChild(container, element);
    this.renderer.appendChild(container, domElem);

    return container;
  }
  private trimSingleQuotes(text: string): string {
    if (text.startsWith("'''")) {
      text = text.substring(3);
    }
    if (text.endsWith("'''")) {
      text = text.substring(0, text.length -3);
    }
    return text;
  }
}
