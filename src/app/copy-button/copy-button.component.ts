import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

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

  copyToClipboard($event: Event) {
    if (!this.textToCopy) return;

    const trimmedText = this.textToCopy.trim();

    try {
      navigator.clipboard.writeText(trimmedText);
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text', err);
    }
    $event.preventDefault();
  }
}
