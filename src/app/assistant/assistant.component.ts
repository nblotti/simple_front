import {Component, computed, OnInit, Signal, signal, ViewChild, WritableSignal} from '@angular/core';
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
  protected assistants: WritableSignal<Assistant[]>;
  protected selectedCategory: WritableSignal<Assistant>;
  assistantName: Signal<string> = computed(() => {
    return this.selectedCategory().name;
  });
  textareaValue: Signal<string> = computed(() => {
    return this.selectedCategory().description;
  });

  constructor(private stateManagerService: StateManagerService, private assistantService: AssistantService) {
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

  addCategory() {
    this.assistantService.createAssistant();
  }


  deleteAssistant() {
    this.assistantService.deleteAssistant(this.selectedCategory().id);
  }

  cloneAssistant() {
    this.assistantService.cloneAssistant(this.selectedCategory().id);
  }

  updateDescription($event: any) {
    if (this.textareaValue() !== $event.target.value) {
      this.selectedCategory.update(value => value.description = $event.target.value);
      this.assistantService.saveAssistant(this.selectedCategory())
    }

  }

  addAssistant() {

    this.addCategory();


  }

  updateName($event: any) {

    if (this.textareaValue() !== $event.target.value) {
      this.selectedCategory.update(value => value.name = $event.target.value);
      this.assistantService.saveAssistant(this.selectedCategory())
    }
  }


}
