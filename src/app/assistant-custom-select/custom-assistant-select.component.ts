import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Assistant} from "../assistant/assistant.service";
import {AsyncPipe} from "@angular/common";

@Component({
  standalone: true,
  selector: 'app-custom-assistant-select',
  templateUrl: './custom-assistant-select.component.html',
  imports: [AsyncPipe],
  styleUrls: ['./custom-assistant-select.component.css']
})
export class CustomAssistantSelectComponent {
  @ViewChild('selectElement') selectElement!: ElementRef<HTMLSelectElement>;
  @Output() selectedCategoryId = new EventEmitter<string>();
  selectedId: string = "";
  private oldAssistants: Assistant[] = [];

  private _categories: Assistant[] = [];

  get categories(): Assistant[] {
    return this._categories;
  }

  @Input() set categories(values: Assistant[]) {
    this._categories = values;
    this.handleCategoryChanges();
  };

  ngOnChanges() {
    this.handleCategoryChanges();
  }

  onSelect($event: any): void {
    this.selectedId = $event.target.value;
    this.selectedCategoryId.emit(this.selectedId);
  }

  addCategory(category: Assistant): void {
    this._categories.push(category);
    this.selectedId = category.id;
    this.selectedCategoryId.emit(this.selectedId);
  }

  deleteAssistant(id: string): void {
    this.selectedId = "";
  }

  addAssistant(): void {
    this.oldAssistants = [...this._categories];
  }

  private handleCategoryChanges(): void {
    const newAssistant = this.findFirstUniqueElement();
    if (this._categories.length > 0) {
      if (!this.selectedId) {
        this.selectedId = this._categories[0]?.id ?? "";
      } else if (newAssistant) {
        this.selectedId = newAssistant.id;
      }
      this.selectedCategoryId.emit(this.selectedId);
      this.oldAssistants = [...this._categories];
    }
    if (this.selectElement != undefined && this.selectedId =="")
      this.selectElement.nativeElement.focus();
  }

  private findFirstUniqueElement(): Assistant | undefined {
    if (this.oldAssistants.length === 0) {
      return undefined;
    }
    const idsInOld = new Set(this.oldAssistants.map(item => item.id));
    return this._categories.find(item => !idsInOld.has(item.id));
  }
}
