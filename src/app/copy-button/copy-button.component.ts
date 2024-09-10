import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copy-button',
  templateUrl: './copy-button.component.html',
  standalone: true,
  styleUrls: ['./copy-button.component.css'],
  imports: [CommonModule]
})
export class CopyButtonComponent {
  @Input() textToCopy: string | undefined;
  @Input() backgroundColor: string | undefined;

  copyToClipboard() {
    if (!this.textToCopy) return;

    const trimmedText = this.textToCopy.trim();

    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.value = trimmedText;

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text', err);
    }

    document.body.removeChild(textarea);
  }
}
