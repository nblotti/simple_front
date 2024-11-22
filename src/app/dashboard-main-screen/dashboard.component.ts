import {Component, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {catchError, map, Observable, Subscription, throwError} from "rxjs";
import {ConversationService} from "./conversation.service";
import {StateManagerService, STATES} from "../state-manager.service";
import {Conversation} from "./Conversation";
import {DatePipe} from "@angular/common";
import {NgEventBus} from "ng-event-bus";
import {UserCategory, UserContextService} from "../auth/user-context.service";
import {DocumentService, DocumentStatus, DocumentType} from "../document.service";
import {GlobalsService} from "../globals.service";
import {SharedGroupDTO} from "./SharedGroupDTO";
import {Document} from "./Document";
import {CapitalizePipe} from "../capitalize.pipe";
import {NavigationStateService} from "../dashboard-document-screen/navigation-state.service";
import {Router} from "@angular/router";

@Component({
  selector: 'dashboard-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, ReactiveFormsModule, CapitalizePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly conversations: WritableSignal<Conversation[]> = signal([]);
  readonly documents: WritableSignal<Document[]> = signal([]);
  readonly templates: WritableSignal<Document[]> = signal([]);

  readonly summaries: WritableSignal<Document[]> = signal([]);
  formPerimeter: FormGroup;
  formShare: FormGroup;
  initialPerimeterCheckboxes: UserCategory[] = [];
  initialShareCheckboxes: UserCategory[] = [];

  /*********************************************************************************************
   /*Changement du périmètre
   /* */


// Utility method to clear the FormArray

  protected readonly document = document;
  protected readonly DocumentStatus = DocumentStatus;
  protected readonly DASHBOARD_SORTABLE_COLUMNS = DASHBOARD_SORTABLE_COLUMNS;
  private buttonStatus = ["Auto refresh", "Disable refresh"]
  protected buttonLabel: string = this.buttonStatus[0]
  private formPerimeterValueChangesSubscription: Subscription | undefined;
  private formShareValueChangesSubscription: Subscription | undefined;
  private groupUrl: string;
  private intervalId: any;

  protected sortOrderArray: { [key: string]: SortOrder } = {
    name: {direction: true},
    status: {direction: false},
    date: {direction: true},
  };

  constructor(
    private conversationService: ConversationService,
    protected userContextService: UserContextService,
    private documentService: DocumentService,
    private stateManagerService: StateManagerService,
    private eventBus: NgEventBus,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    private globalsService: GlobalsService,
    private httpClient: HttpClient,
    private navStateService: NavigationStateService
  ) {

    this.groupUrl = this.globalsService.serverAssistmeBase + "sharedgroup/"

    this.formPerimeter = this.fb.group({
      checkboxesPerimeter: this.fb.array([]) // Initialize the FormArray
    });
    this.formShare = this.fb.group({
      checkboxesShare: this.fb.array([]) // Initialize the FormArray
    });


    this.eventBus.on("reload_data").subscribe(value => {
      this.reload();
    });

  }

  get checkboxesFormPerimeterArray() {
    return this.formPerimeter.get('checkboxesPerimeter') as FormArray;
  }

  get checkboxesFormShareArray() {
    return this.formShare.get('checkboxesShare') as FormArray;
  }

  ngOnDestroy(): void {
    this.unsubscribeFromPerimeterFormValueChanges();
    this.unsubscribeFromShareFormValueChanges();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ngOnInit() {

    this.stateManagerService.setCurrentState(STATES.Dashboard);
    this.loadCategories();
    this.loadGroups();

    this.sortOrderArray[DASHBOARD_SORTABLE_COLUMNS.NAME] = {direction: true};
    this.sortOrderArray[DASHBOARD_SORTABLE_COLUMNS.STATUS] = {direction: false};
    this.sortOrderArray[DASHBOARD_SORTABLE_COLUMNS.DATE] = {direction: false};

  }

  loadCategories() {
    this.unsubscribeFromPerimeterFormValueChanges();
    this.initialPerimeterCheckboxes = this.userContextService.userCategories();
    //on ajoute les checkbox dans la forme
    this.addPerimeterCheckboxes(this.initialPerimeterCheckboxes);
    //on s'inscrit pour le changement
    this.initializePerimeterValueChangesSubscription();
    this.setPerimeter();

  }

  loadGroups() {

    let url = this.groupUrl + "group/user/" + this.userContextService.getUserID()() + "/"
    this.httpClient.get<SharedGroupDTO[]>(url)
      .subscribe({
        next: (groups) => {
          let categories: UserCategory[] = []
          groups.forEach(group => {
            categories.push(new UserCategory(group.id, group.name, false))
          })
          this.unsubscribeFromShareFormValueChanges()
          this.initialShareCheckboxes = categories;
          this.addShareCheckboxes(this.initialShareCheckboxes);
          this.initializeShareValueChangesSubscription();
          this.reload();
        },
        error: (err) => {
          console.error(err);
        }
      });

  }

  addPerimeterCheckboxes(items: UserCategory[]) {
    this.checkboxesFormPerimeterArray.clear();
    items.forEach(item => {
      this.checkboxesFormPerimeterArray.push(this.createPerimeterCheckboxControl(item));
    });
  }

  addShareCheckboxes(items: UserCategory[]) {

    this.checkboxesFormShareArray.clear();
    items.forEach(item => {
      this.checkboxesFormShareArray.push(this.createShareCheckboxControl(item));
    });
  }

  createPerimeterCheckboxControl(item: UserCategory): FormGroup {
    return this.fb.group({
      id: item.id,
      label: item.name,
      value: item.value
    });
  }

  createShareCheckboxControl(item: UserCategory): FormGroup {
    return this.fb.group({
      id: item.id,
      label: item.name,
      value: item.value
    });
  }

  // Method to check if at least one checkbox is selected
  anyCheckboxPerimeterChecked(): boolean {
    return this.checkboxesFormPerimeterArray.controls.some(control => control.get('value')?.value);
  }

  // Method to initialize subscription to form value changes
  initializePerimeterValueChangesSubscription() {
    this.formPerimeterValueChangesSubscription = this.formPerimeter.valueChanges.subscribe(values => {

      const changedIndex = values.checkboxesPerimeter.findIndex((checkbox: any, index: number) =>
        checkbox.value !== this.initialPerimeterCheckboxes[index].value
      );
      if (changedIndex !== -1) {
        this.initialPerimeterCheckboxes[changedIndex].value = !this.initialPerimeterCheckboxes[changedIndex].value;
        this.setPerimeter()
      }

    });
  }

  initializeShareValueChangesSubscription() {
    this.formShareValueChangesSubscription = this.formShare.valueChanges.subscribe(values => {
      const changedIndex = values.checkboxesShare.findIndex((checkbox: any, index: number) =>
        checkbox.value !== this.initialShareCheckboxes[index].value
      );
      if (changedIndex !== -1) {
        this.initialShareCheckboxes[changedIndex].value = !this.initialShareCheckboxes[changedIndex].value;
        this.setPerimeter()
      }

    });
  }

  setPerimeter() {
    let perimeter = "";
    for (let i = 0; i < this.initialPerimeterCheckboxes.length; i++) {
      const value = this.initialPerimeterCheckboxes[i];
      if (value.value) {
        perimeter = i === 0 ? `${perimeter} ${this.userContextService.getUserID()()}` : `${perimeter} ${value.id}`;
      }
    }
    for (let i = 0; i < this.initialShareCheckboxes.length; i++) {
      const value = this.initialShareCheckboxes[i];
      if (value.value) {
        perimeter = `${perimeter} ${value.id}`;
      }
    }

    return this.stateManagerService.setPerimeter(perimeter.trim());
  }

  unsubscribeFromPerimeterFormValueChanges() {
    if (this.formPerimeterValueChangesSubscription) {
      this.formPerimeterValueChangesSubscription.unsubscribe();
    }
  }

  unsubscribeFromShareFormValueChanges() {
    if (this.formShareValueChangesSubscription) {
      this.formShareValueChangesSubscription.unsubscribe();
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
      if ((loc_conversation.pdf_id == 0)) {
        current_conversation = loc_conversation.id;
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

  onDisplayPDF($event: MouseEvent, documentId: string, page: number = -1, content: string = "") {
    let page_number = 0;
    //this.stateManagerService.loadDocument(Number(documentId), page, content);

    const state = {documentId, page, content};
    this.navStateService.setState(state);  // Store state in the service
    this.router.navigate(['/docs']);
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
        this.reload();
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

  addConversation() {
    this.conversationService.createConversation().subscribe(value => {
      this.reloadConversations();
    });
  }

  refreshDashboard() {
    if (this.buttonLabel == this.buttonStatus[0]) {
      this.buttonLabel = this.buttonStatus[1];
      this.intervalId = setInterval(() => {
        this.performScheduledTask();
      }, 120000); // Schedule task every minute
    } else {
      this.buttonLabel = this.buttonStatus[0];
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }
  }

  performScheduledTask() {
    // Implement the logic of your scheduled task here
    console.log('Scheduled task executed at', new Date());
    this.reload();
  }

  clearFormArray(formArray
                 :
                 FormArray
  ) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  reload() {
    this.loadDocuments();
    this.reloadConversations();
    this.loadTemplates();
    this.loadSummary();
    // this.perimeter.set(this.userContextService.userID, true);
  }

  loadDocuments() {
    this.fetchDocuments().subscribe(value => this.documents.set(this.sortDocumentsByName(value, true)));
  }

  loadTemplates() {
    this.fetchTemplates().subscribe(value => this.templates.set(value));
  }

  loadSummary() {
    this.fetchSummaries().subscribe(value => this.summaries.set(value));
  }

  sortDocuments(column: DASHBOARD_SORTABLE_COLUMNS) {

    // Proceed with sorting
    const col = this.sortOrderArray[column];

    if (col == undefined)
      return;

    for (const current_column of Object.keys(this.sortOrderArray)) {
      if (current_column == column)
        this.sortOrderArray[current_column].direction = !this.sortOrderArray[current_column].direction;
      else
        this.sortOrderArray[current_column].direction = false;
    }

    this.sortOrderArray[column] = col


    switch (column) {
      case DASHBOARD_SORTABLE_COLUMNS.NAME:
        this.documents.set(this.sortDocumentsByName(this.documents(), col.direction));
        break;
      case DASHBOARD_SORTABLE_COLUMNS.STATUS:
        this.documents.set(this.sortDocumentsByDocumentStatus(this.documents(), col.direction));
        break;
      case DASHBOARD_SORTABLE_COLUMNS.DATE:
        this.documents.set(this.sortDocumentsByCreatedOn(this.documents(), col.direction));
        break;
      default:
        console.log("Unknown column");
        break;
    }

  }

  protected createSummaryJob($event: MouseEvent, document: Document) {


    document.summary_status = DocumentStatus.REQUESTED
    return this.documentService.requestSummary(this.userContextService.getUserID()(), document.id)
      .pipe(
        catchError(error => {
          console.error('An error occurred:', error);
          return throwError(error);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Job created successfully', response);

          setTimeout(() => {
            this.reload();
          }, 10000); // Wait for 10 seconds

        },
        error: (error) => {
          console.error('An error occurred while creating the job:', error);
        }
      });// Make sure to subscribe to the observable to trigger execution.
  }


  private sortDocumentsByName(documents: Document[], direction: boolean) {
    return documents.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return direction ? comparison : -comparison;
    });
  }

  private sortDocumentsByDocumentStatus(documents: Document[], direction: boolean) {
    return documents.sort((a, b) => {
      const comparison = a.document_status.localeCompare(b.document_status);
      return direction ? comparison : -comparison;
    });
  }

  private sortDocumentsByCreatedOn(documents: Document[], direction: boolean) {
    return documents.sort((a, b) => {
      const comparison = a.created_on.localeCompare(b.created_on);
      return direction ? comparison : -comparison;
    });
  }

  private fetchDocuments(): Observable<Document[]> {
    return this.documentService.fetchDocuments(this.userContextService.getUserID()(), DocumentType.DOCUMENT).pipe(map(response => {
      if (response.length == 0)
        return []

      return response
    }));
  }

  private fetchTemplates(): Observable<Document[]> {
    return this.documentService.fetchDocuments(this.userContextService.getUserID()(), DocumentType.TEMPLATE).pipe(map(response => {
      if (response.length == 0)
        return []
      return response
    }));
  }

  private fetchSummaries(): Observable<Document[]> {
    return this.documentService.fetchDocuments(this.userContextService.getUserID()(), DocumentType.SUMMARY).pipe(map(response => {
      if (response.length == 0)
        return []
      return response
    }));
  }
}

interface SortOrder {
  direction: boolean;
}

export enum DASHBOARD_SORTABLE_COLUMNS {
  NAME = "name",
  STATUS = "status",
  DATE = "date",

}

