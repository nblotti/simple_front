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
import {Document} from "../Document";
import {CapitalizePipe} from "../capitalize.pipe";
import {NavigationStateService} from "../dashboard-document-screen/navigation-state.service";
import {Router} from "@angular/router";
import {SummaryPopupComponent} from "../summary-popup/summary-popup.component";

@Component({
  selector: 'dashboard-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, ReactiveFormsModule, CapitalizePipe, SummaryPopupComponent],
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
  protected sortOrderArray: { [key: string]: SortOrder } = {
    name: {direction: true},
    status: {direction: false},
    date: {direction: true},
  };
  private formPerimeterValueChangesSubscription: Subscription | undefined;
  private formShareValueChangesSubscription: Subscription | undefined;
  private groupUrl: string;
  private intervalId: any;
  protected document2Summarize: Document | undefined;
  protected showSummaryModal: boolean = false;

  constructor(
    private conversationService: ConversationService,
    protected userContextService: UserContextService,
    private documentService: DocumentService,
    private stateManagerService: StateManagerService,
    private eventBus: NgEventBus,
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
    this.reload()
    this.loadCategories();
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

  onDisplayPDF($event: MouseEvent, documentId: string, documentName: string = "", page: number = -1, content: string = "") {

    const state = {documentId, page, content, focus_only: false, documentName};
    this.navStateService.setState(state);  // Store state in the service
    this.router.navigate(['/docs']);
    $event.preventDefault();
  }

  /*********************************************************************************************
   /*Gestion des documents
   /* */
  deleteDocument(blobId: string) {

    this.stateManagerService.wheeWindow.set(true);
    return this.documentService.deleteDocument(Number(blobId)).subscribe({
      next: (result) => {
        console.log('Delete successful:', result);
      },
      error: (error) => {
        console.error('Delete failed:', error);
      },
      complete: () => {
        this.reload();
        this.stateManagerService.wheeWindow.set(false);
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


  clearFormArray(formArray
                 :
                 FormArray
  ) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  reload() {
    this.stateManagerService.wheeWindow.set(true);
    this.loadDocuments();
    this.reloadConversations();
    this.loadTemplates();
    this.loadSummary();

    setTimeout(() => this.stateManagerService.wheeWindow.set(false), 500);
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

  onDisplayFocus($event: MouseEvent, documentId: string, documentName: string) {

    const state = {documentId, focus_only: true, documentName};
    this.navStateService.setState(state);  // Store state in the service
    this.router.navigate(['/docs']);
    $event.preventDefault();
  }

  protected createSummaryJob($event: MouseEvent, document: Document) {

    this.openSummaryDialog(document)

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

  openSummaryDialog(document: Document): void {

    this.stateManagerService.blurWindow.set(true);
    this.document2Summarize = document;
    this.showSummaryModal = true;

  }

  closeSummaryModal(status:boolean): void {
    this.showSummaryModal = false;
    this.stateManagerService.blurWindow.set(false);
    this.reload()
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

