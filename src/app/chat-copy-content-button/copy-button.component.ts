import {Directive, ElementRef, HostBinding, HostListener, Input, Renderer2} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appCopyButton]'
})
export class AppCopyButtonDirective {
  @Input() backgroundColor: string = '';
  @Input() textToCopy: string = '';

  constructor(private renderer: Renderer2, private el: ElementRef) {
  }

  @HostBinding('style.backgroundColor') get setBackgroundColor() {
    return this.backgroundColor;
  }

  @HostListener('click', ['$event']) copyToClipboard(event: Event) {
    event.preventDefault();
    navigator.clipboard.writeText(this.trimSingleQuotes(this.textToCopy)).then(() => {
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  private trimSingleQuotes(text: string): string {
    if (text.startsWith("'''")) {
      text = text.substring(3);
    }
    if (text.endsWith("'''")) {
      text = text.substring(0, text.length - 3);
    }
    return text;
  }
}
