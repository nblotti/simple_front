import {Component, computed, EventEmitter, Input, Output, signal, SimpleChanges, WritableSignal} from '@angular/core';
import {UserContextService} from "../auth/user-context.service";
import {DocumentService, DocumentType} from "../document.service";
import {Document} from "../Document";
import {Assistant, AssistantDocumentType, AssistantService} from "../assistant/assistant.service";
import {CapitalizePipe} from "../capitalize.pipe";
import {CategoryDocument} from "../Document";
import {ReactiveFormsModule} from "@angular/forms";



interface AssistantDocument {
  id: string;
  assistant_id: string;
  document_id: string;
  document_name: string;
  assistant_document_type: string;
  shared_group_id: string
  focus_only: boolean;
}

@Component({
  selector: 'app-document-selector',
  standalone: true,
  imports: [
    CapitalizePipe,
    ReactiveFormsModule
  ],
  templateUrl: './document-selector.component.html',
  styleUrl: './document-selector.component.css'
})
export class DocumentSelectorComponent {

  @Input() showModal: boolean = false;
  @Input() assistant?: Assistant;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  protected initialMyDocuments: Document[] = [];
  protected initialCategoryDocuments: CategoryDocument[] = []
  protected elementsMyDocuments: WritableSignal<Document[]> = signal([]);
  protected selectedMyDocuments: WritableSignal<AssistantDocument[]> = signal([]);

  protected elementsCategoryDocuments: WritableSignal<CategoryDocument[]> = signal([]);
  protected selectedCategoryDocuments: WritableSignal<AssistantDocument[]> = signal([]);


  protected selectedDocuments = computed(() => {
    return this.selectedMyDocuments().concat(this.selectedCategoryDocuments());
  });
  protected selectedPerimeter: WritableSignal<AssistantDocument[]> = signal([]);
  protected activeTab: string = 'my_document';


  constructor(protected userContextService: UserContextService,
              private documentService: DocumentService,
              private assistantService: AssistantService) {

  };

  ngOnChanges(changes: SimpleChanges) {

    if (this.assistant != undefined && changes["showModal"] != undefined && changes["showModal"].currentValue == true) {
      //Loading My documents
      this.documentService.fetchDocuments(this.userContextService.getUserID()(), DocumentType.ALL).subscribe({
        next: (result: Document[]) => {

          result = result.filter(document => !document.focus_only);
          this.elementsMyDocuments.set(result);
          this.initialMyDocuments = result;
        },
        error: (error) => {
          console.error('Load failed:', error);
        },
        complete: () => {
        }
      });
      //Loading Shared documents
      if (this.userContextService.userAdminCategories().length > 0) {
        this.documentService.fetchCategoryDocuments(this.userContextService.getUserID()(), this.userContextService.userAdminCategories()[0].id).subscribe({
          next: (result: CategoryDocument[]) => {
            result = result.filter(document => !document.focus_only);
            this.elementsCategoryDocuments.set(result);
            this.initialCategoryDocuments = result;

          },
          error: (error) => {
            console.error('Load failed:', error);
          },
          complete: () => {
          }
        });
      }
      //Loading selected documents for the assistant
      this.assistantService.loadAssistantDocuments(this.assistant.id).subscribe({
        next: (result: AssistantDocument[]) => {
          result = result.filter(document => !document.focus_only);
          for (const assistantDocument of result)
            if (assistantDocument.assistant_document_type == AssistantDocumentType.MY_DOCUMENTS)
              this.selectedMyDocuments.update(value => [...value, assistantDocument]);
            else if (assistantDocument.assistant_document_type == AssistantDocumentType.CATEGORY_DOCUMENTS)
              this.selectedCategoryDocuments.update(value => [...value, assistantDocument]);
          this.updateMyDocumentsElements();
          this.updateCategoryElements();

        },
        error: (error) => {
          console.error('Load failed:', error);
        },
        complete: () => {
        }
      });


    }

  }

  selectDocumentElement(element: Document) {
    if (!this.assistant)
      return;

    let assistantDocument = {
      id: '',
      assistant_id: this.assistant.id,
      document_id: element.id,
      document_name: element.name,
    };
    //on le sauvegarde sur le serveur comme un élément du périmêtre
    this.assistantService.createAssistantDocument(assistantDocument).subscribe({
      next: (element: AssistantDocument) => {
        //on l'ajoute comme un élément du périmêtre
        this.selectedMyDocuments.update(values => {
          return [...values, element]
        });
        //on le supprime des éléments disponibles
        this.elementsMyDocuments.set(this.elementsMyDocuments().filter(item => item.id != element.document_id));
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });

  }

  selectCategoryElement(element: CategoryDocument) {
    if (!this.assistant)
      return;

    let assistantDocument = {
      id: '',
      assistant_id: this.assistant.id,
      document_id: element.id,
      document_name: element.name,
      assistant_document_type: element.document_type,
      shared_group_id: element.category_id
    };
    //on le sauvegarde sur le serveur comme un élément du périmêtre
    this.assistantService.createAssistantDocument(assistantDocument).subscribe({
      next: (element: AssistantDocument) => {
        //on l'ajoute comme un élément du périmêtre
        this.selectedCategoryDocuments.update(values => {
          return [...values, element]
        });
        //on le supprime des éléments disponibles
        this.elementsCategoryDocuments.set(this.elementsCategoryDocuments().filter(item => item.id != element.document_id));
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });

  }


  removeElement(assistantDocument: AssistantDocument) {

    //on le supprime sur le serveur comme un élément du périmêtre
    this.assistantService.deleteAssistantDocuments(assistantDocument.id).subscribe({
      next: (result) => {

        if (assistantDocument.assistant_document_type == AssistantDocumentType.MY_DOCUMENTS) {
          //on le supprime du périmêtre
          this.selectedMyDocuments.set(this.selectedMyDocuments().filter(value => value.id != assistantDocument.id));
          //on met à jour les éléments non sélectionnés
          this.elementsMyDocuments.set(this.initialMyDocuments);
          this.updateMyDocumentsElements();
        } else if (assistantDocument.assistant_document_type == AssistantDocumentType.CATEGORY_DOCUMENTS) {
          this.selectedCategoryDocuments.set(this.selectedCategoryDocuments().filter(value => value.id != assistantDocument.id));
          //on met à jour les éléments non sélectionnés
          this.elementsCategoryDocuments.set(this.initialCategoryDocuments);
          this.updateCategoryElements();
        }
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });

  }

  closeWindow() {
    this.resetModal();
    this.closeModal.emit();

  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    if (tab == 'category_document') {


      if (this.userContextService.userAdminCategories().length > 0) {
        const firstElement = this.userContextService.userAdminCategories()[this.userContextService.userAdminCategories().length - 1];
        this.retrieveDocumentsForCategory(firstElement.id)
      }
    }
  }

  protected categoryValueChanged($event: Event) {
    const selectElement = $event.target as HTMLSelectElement;
    this.retrieveDocumentsForCategory(selectElement.value);


  }

  private retrieveDocumentsForCategory(selectElement: string) {
    this.documentService.fetchCategoryDocuments(this.userContextService.getUserID()(), selectElement).subscribe({

      next: (element: CategoryDocument[]) => {
        //on l'ajoute comme un élément du périmêtre
        this.initialCategoryDocuments = element;
        this.elementsCategoryDocuments.set(element);
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });
  }

  private updateMyDocumentsElements() {
    // Create an array to hold the filtered elements
    let filteredElements: Document[] = [];

    // Iterate through each item in elementsZone1 using forEach
    this.elementsMyDocuments().forEach(item => {
      // Iterate through each item in selectedElementsZone1 using forEach
      this.selectedMyDocuments().forEach(selectedItem => {
        // Check if the document_id matches the id of the item
        if (selectedItem.document_id === item.id) {
          // Add the item to the filteredElements array
          filteredElements.push(item);
          return; // Exit the inner forEach loop as match is found
        }
      });
    });

    // Remove the elements in filteredElements from elementsZone1
    this.elementsMyDocuments.set(
      this.elementsMyDocuments().filter(item =>
        !filteredElements.some(filteredItem => filteredItem.id === item.id)
      )
    );
  }


  private updateCategoryElements() {
    // Create an array to hold the filtered elements
    let filteredElements: CategoryDocument[] = [];

    // Iterate through each item in elementsZone1 using forEach
    this.elementsCategoryDocuments().forEach(item => {
      // Iterate through each item in selectedElementsZone1 using forEach
      this.selectedCategoryDocuments().forEach(selectedItem => {
        // Check if the document_id matches the id of the item
        if (selectedItem.document_id === item.id) {
          // Add the item to the filteredElements array
          filteredElements.push(item);
          return; // Exit the inner forEach loop as match is found
        }
      });
    });

    // Remove the elements in filteredElements from elementsZone1
    this.elementsCategoryDocuments.set(
      this.elementsCategoryDocuments().filter(item =>
        !filteredElements.some(filteredItem => filteredItem.id === item.id)
      )
    );
  }

  private resetModal() {
    this.selectedMyDocuments.set([]);
    this.selectedCategoryDocuments.set([]);
    this.selectedPerimeter.set([]);

  }
}
