import {Component, computed, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {StateManagerService, STATES} from "../state-manager.service";
import {NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {Assistant, AssistantService} from "./assistant.service";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [NgbDropdownModule, FormsModule],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css'
})
export class AssistantComponent implements OnInit {

  readonly models: WritableSignal<Map<string, string>> = signal(new Map<string, string>())
  textareaValue: string = ""
  selectedValue: number = 0;
  assistants: Signal<Assistant[]> = computed((): Assistant[] => {
    return this.assistantService.getAssistants()();

  });
  assistantName: string = ""

  constructor(private stateManagerService: StateManagerService, private assistantService: AssistantService) {
  }

  ngOnInit(): void {

    this.stateManagerService.setCurrentState(STATES.Assistant);


    if (this.assistants().length >= 1) {
      this.selectedValue = 1;
      this.textareaValue = this.assistants()[0].description
      this.assistantName = this.assistants()[0].name
    }

  }

  deleteAssistant() {

  }

  cloneAssistant() {

  }

  updateDescription($event: any) {
    if (this.textareaValue !== $event.target.value) {
      this.textareaValue = $event.target.value
      // Add your logic to save the value (e.g., an API call)
      let assistant = this.getAssistant(this.selectedValue.toString())
      if (assistant) {
        assistant.description = $event.target.value
        this.assistantService.saveAssistant(assistant)
      }
    }
  }


  onSelect(object?: any) {

    let assistant = this.getAssistant(object.target.value)
    if (assistant) {
      this.textareaValue = assistant.description;
      this.assistantName = assistant.name;
    }

  }

  addAssistant() {

    this.assistantService.createAssistant();

  }

  updateName($event: any) {
    if (this.textareaValue !== $event.target.value) {
      console.log('Value saved:', $event.target.value);
      let assistant = this.getAssistant(this.selectedValue.toString())
      if (assistant) {
        assistant.name = $event.target.value
        this.assistantService.saveAssistant(assistant)
      }
    }
  }

  getAssistant(id: string) {
    for (const assistant of this.assistants()) {
      if (assistant.id == id) {
        return assistant;
      }
    }
    return null;
  }

}
