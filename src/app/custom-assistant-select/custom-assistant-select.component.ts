import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Assistant} from "../assistant/assistant.service";



@Component({
  standalone: true,
  selector: 'app-custom-assistant-select',
  templateUrl: './custom-assistant-select.component.html',
  styleUrls: ['./custom-assistant-select.component.css']
})
export class CustomAssistantSelectComponent {
  @Input() categories: Assistant[] = [];
  @Output() selectedCategoryId = new EventEmitter<string>();

  selectedId: string = "";

  ngOnChanges() {
    if (this.categories.length > 0) {
      this.selectedId = this.categories[0].id;
      this.selectedCategoryId.emit(this.selectedId);
    }
  }

  onSelect($event: any) {
    this.selectedId = $event.target.value;
    this.selectedCategoryId.emit(this.selectedId);
  }

  addCategory(category: Assistant) {
    this.categories.push(category);
    this.selectedId = category.id;
    this.selectedCategoryId.emit(this.selectedId);
  }

  deleteAssistant(id: string) {
    const index = this.categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
      if (this.categories.length > 0) {
        this.selectedId = this.categories[0].id;
      } else {
        this.selectedId = "";
      }
      this.selectedCategoryId.emit(this.selectedId);
    }
  }


}
