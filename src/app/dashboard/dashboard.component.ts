import {Component, effect, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {map, Observable, Subscription} from "rxjs";
import {ConversationService} from "./conversation.service";
import {StateManagerService, STATES} from "../state-manager.service";
import {Conversation} from "./Conversation";
import {DatePipe, NgIf} from "@angular/common";
import {NgEventBus} from "ng-event-bus";
import {UserCategory, UserContextService} from "../auth/user-context.service";
import {DocumentService} from "../document.service";
import {SharedGroup} from "../share/SharedGroup";
import {GlobalsService} from "../globals.service";

@Component({
  selector: 'dashboard-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, NgIf, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly conversations: WritableSignal<Conversation[]> = signal([]);
  readonly documents: WritableSignal<string[][]> = signal([]);
  formLeft: FormGroup;
  formRight: FormGroup;
  initialLeftCheckboxes: UserCategory[] = [];
  initialRightCheckboxes: UserCategory[] = [];
  private formLeftValueChangesSubscription: Subscription | undefined;
  private formRightValueChangesSubscription: Subscription | undefined;
  private groupUrl: string;

  constructor(
    private conversationService: ConversationService,
    protected userContextService: UserContextService,
    private documentService: DocumentService,
    private stateManagerService: StateManagerService,
    private eventBus: NgEventBus,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private globalsService: GlobalsService,
    private httpClient: HttpClient
  ) {

    this.groupUrl = this.globalsService.serverBase + "sharedgroup/"

    this.formLeft = this.fb.group({
      checkboxesLeft: this.fb.array([]) // Initialize the FormArray
    });
    this.formRight = this.fb.group({
      checkboxesRight: this.fb.array([]) // Initialize the FormArray
    });


    this.eventBus.on("reload_data").subscribe(value => {
      this.reload();
    });

  }

  get checkboxesFormLeftArray() {
    return this.formLeft.get('checkboxesLeft') as FormArray;
  }

  get checkboxesFormRightArray() {
    return this.formRight.get('checkboxesRight') as FormArray;
  }

  ngOnDestroy(): void {
    this.unsubscribeFromLeftFormValueChanges();
    this.unsubscribeFromRightFormValueChanges();
  }


  ngOnInit() {

    this.stateManagerService.setCurrentState(STATES.Dashboard);
    this.loadCategories();
    this.loadGroups();

  }

  loadCategories(){
    this.unsubscribeFromLeftFormValueChanges();
    this.initialLeftCheckboxes = this.userContextService.userCategories();
    //on ajoute les checkbox dans la forme
    this.addLeftCheckboxes(this.initialLeftCheckboxes);
    //on s'inscrit pour le changement
    this.initializeLeftValueChangesSubscription();
    this.setPerimeter();

  }
  loadGroups() {

    let url = this.groupUrl + "owner/" + this.userContextService.getUserID()() + "/"
    this.httpClient.get<SharedGroup[]>(url)
      .subscribe({
        next: (groups) => {
          let categories: UserCategory[] = []
          groups.forEach(group => {
            categories.push(new UserCategory(group.id, group.name, false, group.owner))
          })
          this.unsubscribeFromRightFormValueChanges()
          this.initialRightCheckboxes = categories;
          this.addRightCheckboxes(this.initialRightCheckboxes);
          this.initializeRightValueChangesSubscription();
          this.reload();
        },
        error: (err) => {
          console.error(err);
        }
      });

  }


  addLeftCheckboxes(items: UserCategory[]) {
    this.checkboxesFormLeftArray.clear();
    items.forEach(item => {
      this.checkboxesFormLeftArray.push(this.createLeftCheckboxControl(item));
    });
  }

  addRightCheckboxes(items: UserCategory[]) {

    this.checkboxesFormRightArray.clear();
    items.forEach(item => {
      this.checkboxesFormRightArray.push(this.createRightCheckboxControl(item));
    });
  }

  createLeftCheckboxControl(item: UserCategory): FormGroup {
    return this.fb.group({
      id: item.id,
      label: item.label,
      value: item.value
    });
  }

  createRightCheckboxControl(item: UserCategory): FormGroup {
    return this.fb.group({
      id: item.id,
      label: item.label,
      value: item.value
    });
  }

  // Method to check if at least one checkbox is selected
  anyCheckboxLeftChecked(): boolean {
    return this.checkboxesFormLeftArray.controls.some(control => control.get('value')?.value);
  }



  // Method to initialize subscription to form value changes
  initializeLeftValueChangesSubscription() {
    this.formLeftValueChangesSubscription = this.formLeft.valueChanges.subscribe(values => {
      // dans le cas ou aucune checkbox n'est active
      if (!this.anyCheckboxLeftChecked()) {
        const checkboxesArray = this.checkboxesFormLeftArray.controls;

        for (let i = 0; i < this.initialLeftCheckboxes.length; i++) {
          let currentcb = checkboxesArray[i].get('value');
          if (currentcb != null)
            currentcb.setValue(this.initialLeftCheckboxes[i].value); // Setting all checkboxes to checked

        }

      } else {
        const changedIndex = values.checkboxesLeft.findIndex((checkbox: any, index: number) =>
          checkbox.value !== this.initialLeftCheckboxes[index].value
        );
        if (changedIndex !== -1) {
          this.initialLeftCheckboxes[changedIndex].value = !this.initialLeftCheckboxes[changedIndex].value;
          this.setPerimeter()
        }
      }

    });
  }

  initializeRightValueChangesSubscription() {
    this.formRightValueChangesSubscription = this.formRight.valueChanges.subscribe(values => {
      const changedIndex = values.checkboxesRight.findIndex((checkbox: any, index: number) =>
        checkbox.value !== this.initialRightCheckboxes[index].value
      );
      if (changedIndex !== -1) {
        this.initialRightCheckboxes[changedIndex].value = !this.initialRightCheckboxes[changedIndex].value;
        this.setPerimeter()
      }

    });
  }


  setPerimeter() {
    let perimeter = "";
    for (let i = 0; i < this.initialLeftCheckboxes.length; i++) {
      const value = this.initialLeftCheckboxes[i];
      if (value.value) {
        perimeter = i === 0 ? `${perimeter} ${this.userContextService.getUserID()()}` : `${perimeter} ${value.id}`;
      }
    }
    for (let i = 0; i < this.initialRightCheckboxes.length; i++) {
      const value = this.initialRightCheckboxes[i];
      if (value.value) {
        perimeter = `${perimeter} ${value.id}`;
      }
    }
    console.log(perimeter.trim());
    return this.conversationService.setDocumentPerimeter(perimeter.trim());
  }

  unsubscribeFromLeftFormValueChanges() {
    if (this.formLeftValueChangesSubscription) {
      this.formLeftValueChangesSubscription.unsubscribe();
    }
  }

  unsubscribeFromRightFormValueChanges() {
    if (this.formRightValueChangesSubscription) {
      this.formRightValueChangesSubscription.unsubscribe();
    }
  }

  reloadConversations() {
    this.conversationService.loadConversations().subscribe({
      next: (result) => {
        this.conversations.update((value) => result);
        this.selectCurrentConversation();
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });
  }

  selectCurrentConversation() {
    let current_conversation: number = 0;
    let current_date = this.datePipe.transform(new Date(), 'dd.MM.yyyy');
    this.conversations().forEach((loc_conversation) => {
      if ((loc_conversation.pdf_id == 0) && loc_conversation.created_on == current_date) {
        if (current_conversation != 0 || current_conversation < loc_conversation.id) {
          current_conversation = loc_conversation.id;
        }
      }
    });
    if (current_conversation == 0) {
      this.conversationService.createConversation().subscribe(value => {
        this.setConversation(value.id);
      });
    } else {
      this.setConversation(current_conversation);
    }
  }

  onDisplayPDF($event: MouseEvent, documentId: string) {
    let page_number = 0;
    this.stateManagerService.loadDocument(Number(documentId));
    $event.preventDefault();
  }

  /*********************************************************************************************
   /*Gestion des documents
   /* */
  deleteDocument(blobId: string) {
    return this.documentService.deleteDocument(Number(blobId)).subscribe({
      next: (result) => {
        console.log('Delete successful:', result);
      },
      error: (error) => {
        console.error('Delete failed:', error);
      },
      complete: () => {
        this.loadDocuments();
        this.reloadConversations();
      }
    });
  }

  /*********************************************************************************************
   /*Gestion des conversations
   /* */
  deleteConversation(id: number) {
    this.conversationService.deleteConversation(id).subscribe(value => {
      this.reloadConversations();
    });
  }

  isCurrentConversation(id: number) {
    return this.conversationService.getCurrentConversation() == id;
  }

  setConversation(conversation_id: number) {
    this.stateManagerService.setCurrentConversation(conversation_id);
  }

  setDocumentConversation(conversation_id: number, pdf_id: number) {
    this.stateManagerService.loadConversationAndDocument(conversation_id, pdf_id);
  }

  addConversation() {
    this.conversationService.createConversation().subscribe(value => {
      this.reloadConversations();
    });
  }

  /*********************************************************************************************
   /*Changement du périmètre
   /* */





  // Utility method to clear the FormArray
  private clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  private reload() {
    this.loadDocuments();
    this.reloadConversations();
    // this.perimeter.set(this.userContextService.userID, true);
  }

  private loadDocuments() {
    this.fetchDocuments().subscribe(value => this.documents.set(value));
  }

  private fetchDocuments(): Observable<string[][]> {
    return this.documentService.fetchDocuments(this.userContextService.getUserID()()).pipe(map(response => {
      if (response.length == 0)
        return []
      return response
    }));
  }
}

