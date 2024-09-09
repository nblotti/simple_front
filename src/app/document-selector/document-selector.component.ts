import {Component, EventEmitter, Input, Output, signal, SimpleChanges, WritableSignal} from '@angular/core';
import {UserContextService} from "../auth/user-context.service";
import {DocumentService, DocumentType} from "../document.service";
import {Document} from "../share/Document";
import {Assistant, AssistantService} from "../assistant/assistant.service";


interface Element {
  id: number;
  name: string;
  age: number;
  gender: string;
}

interface AssistantDocument {
  id: string;
  assistant_id: string;
  document_id: string;
  document_name: string;
}

@Component({
  selector: 'app-document-selector',
  standalone: true,
  imports: [],
  templateUrl: './document-selector.component.html',
  styleUrl: './document-selector.component.css'
})
export class DocumentSelectorComponent {

  @Input() showModal: boolean = false;
  @Input() assistant?: Assistant;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  protected initialElementsZone1: Document[] = [];
  protected elementsZone1: WritableSignal<Document[]> = signal([]);
  protected elementsZone2: WritableSignal<Document[]> = signal([]);
  protected selectedElementsZone1: WritableSignal<AssistantDocument[]> = signal([]);
  protected selectedElementsZone2: WritableSignal<AssistantDocument[]> = signal([]);

  constructor(protected userContextService: UserContextService,
              private documentService: DocumentService,
              private assistantService: AssistantService) {

  };

  ngOnChanges(changes: SimpleChanges) {

    if (this.assistant != undefined && changes["showModal"] != undefined && changes["showModal"].currentValue == true) {
      this.documentService.fetchDocuments(this.userContextService.getUserID()(), DocumentType.ALL).subscribe({
        next: (result: Document[]) => {

          this.elementsZone1.set(result);
          this.initialElementsZone1 = result;
        },
        error: (error) => {
          console.error('Load failed:', error);
        },
        complete: () => {
        }
      });


      this.assistantService.loadAssistantDocuments(this.assistant.id).subscribe({
        next: (result: AssistantDocument[]) => {
          this.selectedElementsZone1.set(result);
          this.updateZone1Elements();

        },
        error: (error) => {
          console.error('Load failed:', error);
        },
        complete: () => {
        }
      });
    }

  }

  selectElement(element: Document, zone: number) {
    if (!this.assistant)
      return;
    if (zone === 1) {
      let assistantDocument = {
        id: '',
        assistant_id: this.assistant.id,
        document_id: element.id,
        document_name: element.name
      };
      this.assistantService.createAssistantDocument(assistantDocument).subscribe({
        next: (element: AssistantDocument) => {
          this.selectedElementsZone1.update(values => {
            return [...values, element]
          });
          this.elementsZone1.set(this.elementsZone1().filter(item => item.id != element.document_id));
        },
        error: (error) => {
          console.error('Load failed:', error);
        },
        complete: () => {
        }
      });

    } else if (zone === 2) {
      this.selectedElementsZone2.update(values => {
        return [...values]
      });
    }
  }

  removeElement(assistantDocument: AssistantDocument, zone: number) {
    if (zone === 1) {
      this.assistantService.deleteAssistantDocuments(assistantDocument.id).subscribe({
        next: (result) => {
          this.selectedElementsZone1.set(this.selectedElementsZone1().filter(value => value.id != assistantDocument.id));
          this.elementsZone1.set(this.initialElementsZone1);
          this.updateZone1Elements();
        },
        error: (error) => {
          console.error('Load failed:', error);
        },
        complete: () => {
        }
      });
    } else if (zone === 2) {

    }
  }

  closeWindow() {
    this.resetModal();
    this.closeModal.emit();

  }

  private updateZone1Elements() {
    // Create an array to hold the filtered elements
    let filteredElements: Document[] = [];

    // Iterate through each item in elementsZone1 using forEach
    this.elementsZone1().forEach(item => {
      // Iterate through each item in selectedElementsZone1 using forEach
      this.selectedElementsZone1().forEach(selectedItem => {
        // Check if the document_id matches the id of the item
        if (selectedItem.document_id === item.id) {
          // Add the item to the filteredElements array
          filteredElements.push(item);
          return; // Exit the inner forEach loop as match is found
        }
      });
    });

    // Remove the elements in filteredElements from elementsZone1
    this.elementsZone1.set(
      this.elementsZone1().filter(item =>
        !filteredElements.some(filteredItem => filteredItem.id === item.id)
      )
    );
  }

  private resetModal() {
    this.selectedElementsZone1.set([]);
    this.selectedElementsZone2.set([]);
  }


}
