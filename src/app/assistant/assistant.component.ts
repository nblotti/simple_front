import {Component, ElementRef, OnInit, Renderer2, signal, ViewChild, WritableSignal} from '@angular/core';
import {StateManagerService, STATES} from "../state-manager.service";
import {NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {Assistant, AssistantService} from "./assistant.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CustomAssistantSelectComponent} from "../assistant-custom-select/custom-assistant-select.component";
import {UserContextService} from "../auth/user-context.service";
import {DocumentSelectorComponent} from "../assistant-document-selector/document-selector.component";
import {FileUploadDialogComponent} from "../dashboard-document-upload/file-upload-dialog.component";
import {AppFavoriteComponent} from "../app-favorite/app-favorite.component";
import {AsyncPipe, CommonModule} from "@angular/common";
import {toObservable} from "@angular/core/rxjs-interop";


@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, FormsModule, CustomAssistantSelectComponent, ReactiveFormsModule, DocumentSelectorComponent, FileUploadDialogComponent, AppFavoriteComponent, AsyncPipe],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css'
})
export class AssistantComponent implements OnInit {

  showModal: boolean = false;
  readonly models: WritableSignal<Map<string, string>> = signal(new Map<string, string>())
  @ViewChild(CustomAssistantSelectComponent) customSelectComponent!: CustomAssistantSelectComponent;
  @ViewChild('inputName') inputName!: ElementRef;
  options = [
    {value: '4o', label: 'gpt4o'},
    {value: '4o-mini', label: 'gpt4o-mini'}
  ];
  assistant_favorite_status: WritableSignal<boolean> = signal(false);
  protected assistants: WritableSignal<Assistant[]> = this.assistantService.getAssistants();
  protected selectedCategory: WritableSignal<Assistant> = signal<Assistant>(this.assistants()[0]);




  constructor(private stateManagerService: StateManagerService, private assistantService: AssistantService,
              private renderer: Renderer2, protected userContextService: UserContextService) {

    let groups = this.userContextService.getGroups()();
    if (groups.includes("agp_prod_gpt4")) {
      this.options.push({value: '4', label: 'gpt4'});
    }
  }


  ngOnInit(): void {

    this.stateManagerService.setCurrentState(STATES.Assistant);
    this.assistantService.loadAssistants();

  }

  onCategorySelect(id: string) {
    for (let category of this.assistants()) {
      if (category.id == id) {
        this.stateManagerService.setCurrentConversation(Number.parseInt(category.conversation_id))
        this.selectedCategory.set(category);
      }
    }
  }

  deleteAssistant() {
    this.customSelectComponent.deleteAssistant(this.selectedCategory().id);
    this.assistantService.deleteAssistant(this.selectedCategory().id);
    this.customSelectComponent.selectElement.nativeElement.focus();
  }

  cloneAssistant() {
    this.customSelectComponent.addAssistant();
    this.assistantService.cloneAssistant(this.selectedCategory().id);
    this.inputName.nativeElement.focus();
  }

  updateDescription($event: any) {
    this.selectedCategory().description = $event.target.value;
    this.assistantService.updateAssistant(this.selectedCategory())
  }

  addAssistant() {
    this.customSelectComponent.addAssistant();
    this.assistantService.createAssistant();
    this.inputName.nativeElement.focus();


  }

  updateName($event: any) {
    this.selectedCategory().name = $event.target.value;
    this.assistantService.updateAssistant(this.selectedCategory())
  }

  onTextAreaFocused($event: any) {
    const textarea = $event.target as HTMLTextAreaElement;
    setTimeout(() => textarea.select(), 0);
  }


  modelValueChanged(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    let assistant: Assistant = this.selectedCategory();
    assistant.gpt_model_number = selectElement.value;
    this.assistantService.updateAssistant(this.selectedCategory())
  }

  perimeterChanged($event: any) {

    const selectElement = $event.target as HTMLInputElement;
    let isChecked = $event.target.checked;
    if (this.selectedCategory().use_documents !== isChecked) {
      let assistant: Assistant = this.selectedCategory();

      assistant.use_documents = isChecked;

      this.assistantService.updateAssistant(this.selectedCategory())
    }
  }

  showFileSelector() {
    this.showModal = true;
    this.stateManagerService.blurWindow.set(true);

  }

  closeSelector() {
    this.showModal = false;
    this.stateManagerService.blurWindow.set(false);
  }

  handleFavoriteChange($event: boolean) {
    this.selectedCategory().favorite = $event;
    this.assistantService.updateAssistant(this.selectedCategory())
    if ($event) {
      for (const assistant of this.assistants()) {
        if (assistant.id != this.selectedCategory().id) {
          assistant.favorite = false;
          this.assistantService.updateAssistant(assistant);
        }
      }
    }

  }
}
