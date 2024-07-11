import {Component, computed, OnInit, Signal, signal, ViewChild, WritableSignal} from '@angular/core';
import {StateManagerService, STATES} from "../state-manager.service";
import {NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {Assistant, AssistantService} from "./assistant.service";
import {FormsModule} from "@angular/forms";
import {CustomAssistantSelectComponent} from "../custom-assistant-select/custom-assistant-select.component";
import {UserContextService} from "../user-context.service";


@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [NgbDropdownModule, FormsModule, CustomAssistantSelectComponent],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css'
})
export class AssistantComponent implements OnInit {

  readonly models: WritableSignal<Map<string, string>> = signal(new Map<string, string>())

  protected assistants: Signal<Assistant[]> = computed((): Assistant[] => {
    return this.assistantService.getAssistants()();

  });
  @ViewChild(CustomAssistantSelectComponent) customSelectComponent!: CustomAssistantSelectComponent;
  selectedCategory: WritableSignal<Assistant> = signal<Assistant>(this.assistants()[0])
  assistantName: Signal<string> = computed(() => {
    return this.selectedCategory().name;
  });
  textareaValue: Signal<string> = computed(() => {
    return this.selectedCategory().description;
  });

  constructor(private stateManagerService: StateManagerService, private assistantService: AssistantService) {
  }

  ngOnInit(): void {

    this.stateManagerService.setCurrentState(STATES.Assistant);

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

  removeCategory() {
    this.customSelectComponent.removeCategory(this.selectedCategory().id);
  }


  deleteAssistant() {

  }

  cloneAssistant() {

  }

  updateDescription($event: any) {
    if (this.textareaValue() !== $event.target.value) {
      this.selectedCategory.update(value => value.description = $event.target.value);
      this.assistantService.saveAssistant(this.selectedCategory())
    }

  }

  /*
    onSelect(object?: any) {

      let assistant = this.getAssistant(object.target.value)
      if (assistant) {
        this.textareaValue = assistant.description;
        this.assistantName = assistant.name;
      }

    }
  */
  addAssistant() {

    this.addCategory();
    //this.assistantService.createAssistant();

  }

  updateName($event: any) {

    if (this.textareaValue() !== $event.target.value) {
      this.selectedCategory.update(value => value.name = $event.target.value);
      this.assistantService.saveAssistant(this.selectedCategory())
    }
  }

  /*
    getAssistant(id: string) {
      for (const assistant of this.assistants()) {
        if (assistant.id == id) {
          return assistant;
        }
      }
      return null;
    }
  */
}
