import {
  Component,
  computed,
  ElementRef,
  OnInit,
  Renderer2,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {StateManagerService, STATES} from "../state-manager.service";
import {NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {Assistant, AssistantService} from "./assistant.service";
import {FormsModule} from "@angular/forms";
import {CustomAssistantSelectComponent} from "../custom-assistant-select/custom-assistant-select.component";


@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [NgbDropdownModule, FormsModule, CustomAssistantSelectComponent],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css'
})
export class AssistantComponent implements OnInit {

  readonly models: WritableSignal<Map<string, string>> = signal(new Map<string, string>())
  @ViewChild(CustomAssistantSelectComponent) customSelectComponent!: CustomAssistantSelectComponent;
  @ViewChild('inputName') inputName!: ElementRef;

  protected assistants: WritableSignal<Assistant[]>;
  protected selectedCategory: WritableSignal<Assistant>;

  assistantName: Signal<string> = computed(() => {
    if (this.selectedCategory() != undefined)
      return this.selectedCategory().name;
    else return "";
  });
  textareaValue: Signal<string> = computed(() => {
    if (this.selectedCategory() != undefined)
      return this.selectedCategory().description;
    else return "";
  });

  constructor(private stateManagerService: StateManagerService, private assistantService: AssistantService,
              private renderer: Renderer2) {
    this.assistants = this.assistantService.getAssistants();
    this.selectedCategory = signal<Assistant>(this.assistants()[0]);

  }


  ngOnInit(): void {

    this.stateManagerService.setCurrentState(STATES.Assistant);
    this.assistantService.loadAssistants();

  }

  onCategorySelect(id: string) {
    for (let category of this.assistants()) {
      if (category.id == id) {
        this.selectedCategory.set(category);
      }
    }
    console.log('Selected Category ID:', id);
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
    if (this.textareaValue() !== $event.target.value) {
      let assistant: Assistant = this.selectedCategory();
      assistant.description = $event.target.value;
      this.assistantService.updateAssistant(this.selectedCategory())
    }
  }

  addAssistant() {
    this.customSelectComponent.addAssistant();
    this.assistantService.createAssistant();
    this.inputName.nativeElement.focus();


  }

  updateName($event: any) {

    if (this.textareaValue() !== $event.target.value) {
      let assistant: Assistant = this.selectedCategory();
      assistant.name = $event.target.value;
      this.assistantService.updateAssistant(this.selectedCategory())
    }
  }

  onTextAreaFocused($event: any){
    const textarea = $event.target as HTMLTextAreaElement;
    setTimeout(() => textarea.select(), 0);
  }


}
