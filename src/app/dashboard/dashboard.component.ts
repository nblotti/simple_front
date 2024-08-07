import {Component, effect, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {map, Observable, Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ConversationService} from "./conversation.service";
import {StateManagerService, STATES} from "../state-manager.service";
import {Conversation} from "./Conversation";
import {DatePipe, NgIf} from "@angular/common";
import {NgEventBus} from "ng-event-bus";
import {UserCategory, UserContextService} from "../auth/user-context.service";
import {DocumentService} from "../document.service";

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
  form: FormGroup;
  initialCheckboxes: UserCategory[] = [];
  private formValueChangesSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    protected httpClient: HttpClient,
    private conversationService: ConversationService,
    protected userContextService: UserContextService,
    private documentService: DocumentService,
    private stateManagerService: StateManagerService,
    private eventBus: NgEventBus,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      checkboxes: this.fb.array([]) // Initialize the FormArray
    });


    this.eventBus.on("reload_data").subscribe(value => {
      this.reload();
    });

    effect(() => {
      this.initialCheckboxes = this.userContextService.userCategories();

      //on ajoute les checkbox dans la forme
      this.addCheckboxes(this.initialCheckboxes);
      //on s'inscrit pour le changement
      this.initializeValueChangesSubscription();
      //on set le perimêtre initial au profil de l'utilisateur
      this.conversationService.setDocumentPerimeter(this.userContextService.getUserID()())
    });

  }

  get checkboxesFormArray() {
    return this.form.get('checkboxes') as FormArray;
  }

  ngOnDestroy(): void {
    this.unsubscribeFromFormValueChanges();
  }


  ngOnInit() {

    this.stateManagerService.setCurrentState(STATES.Dashboard);
    this.reload();


  }


  addCheckboxes(items: UserCategory[]) {
    this.checkboxesFormArray.clear();
    items.forEach(item => {
      this.checkboxesFormArray.push(this.createCheckboxControl(item));
    });
  }

  createCheckboxControl(item: UserCategory): FormGroup {
    return this.fb.group({
      id: item.id,
      label: item.label,
      value: item.value
    });
  }

  // Method to check if at least one checkbox is selected
  anyCheckboxChecked(): boolean {
    return this.checkboxesFormArray.controls.some(control => control.get('value')?.value);
  }



  // Method to initialize subscription to form value changes
  initializeValueChangesSubscription() {
    this.formValueChangesSubscription = this.form.valueChanges.subscribe(values => {
      // dans le cas ou aucune checkbox n'est active
      if (!this.anyCheckboxChecked()) {
        const checkboxesArray = this.checkboxesFormArray.controls;

        for (let i = 0; i < this.initialCheckboxes.length; i++) {
          let currentcb = checkboxesArray[i].get('value');
          if( currentcb != null)
            currentcb.setValue(this.initialCheckboxes[i].value); // Setting all checkboxes to checked

        }

      } else {
        const changedIndex = values.checkboxes.findIndex((checkbox: any, index: number) =>
          checkbox.value !== this.initialCheckboxes[index].value
        );
        if (changedIndex !== -1) {
          this.initialCheckboxes[changedIndex].value = !this.initialCheckboxes[changedIndex].value;
          this.setPerimeter()
        }
      }

    });
  }

  setPerimeter() {
    let perimeter = "";
    for (let i = 0; i < this.initialCheckboxes.length; i++) {
      const value = this.initialCheckboxes[i];
      if (value.value) {
        perimeter = i === 0 ? `${perimeter} ${this.userContextService.getUserID()()}` : `${perimeter} ${value.id}`;
      }
    }
    return this.conversationService.setDocumentPerimeter(perimeter);
  }

  unsubscribeFromFormValueChanges() {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
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

