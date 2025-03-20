import {Component, EventEmitter, Input, OnInit, Output, signal, WritableSignal} from '@angular/core';
import {Document} from "../Document";
import {FormsModule} from "@angular/forms";
import {catchError, throwError} from "rxjs";
import {DocumentService, DocumentStatus} from "../document.service";
import {UserContextService} from "../auth/user-context.service";
import {StateManagerService} from "../state-manager.service";

@Component({
  selector: 'app-summary-popup',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './summary-popup.component.html',
  styleUrl: './summary-popup.component.css'
})
export class SummaryPopupComponent {
  @Input() showModal: boolean = false;
  @Input() documentID: string | undefined;
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  private defaultString: string = "Create a detailed summary of a provided document\n" +
    "\n" +
    "Start with an overall description, followed by a detailed examination of each important element. Conclude with a concise recap that synthesizes the main points.\n" +
    "\n" +
    "# Steps\n" +
    "\n" +
    "1. **Overall Description:** Begin by outlining the document's primary focus, purpose, and the main idea it seeks to convey.\n" +
    "2. **Element Analysis:** Identify and elaborate on each significant element within the document. Discuss how each element contributes to the overall theme or objective.\n" +
    "3. **Recap:** End with a brief recap of the crucial points discussed, reinforcing the document's intended takeaway.\n" +
    "\n" +
    "# Output Format\n" +
    "\n" +
    "- A coherent and well-structured paragraph that adheres to the given instructions.\n" +
    "- Utilize formal language without unnecessary jargon.\n" +
    "- Ensure transitions between sections are smooth and logical.\n" +
    "\n" +
    "# Examples\n" +
    "\n" +
    "**Example Input:**\n" +
    "\n" +
    "- A document detailing the impact of climate change on ocean ecosystems.\n" +
    "\n" +
    "**Example Output:**\n" +
    "\n" +
    "1. **Overall Description:** The document provides an in-depth analysis of how climate change is affecting ocean ecosystems globally, focusing primarily on the rising temperatures, acidification, and pollutant influx.\n" +
    "   \n" +
    "2. **Element Analysis:** The first element explored is rising sea temperatures, which has led to coral bleaching, affecting marine biodiversity. The second element, ocean acidification, describes how increased CO2 concentrations hinder marine life calcification processes. Lastly, the effect of pollution is highlighted, with a focus on plastic waste impacting food chains.\n" +
    "\n" +
    "3. **Recap:** In summary, the document underscores the urgency for immediate action in mitigating climate change effects to preserve marine biodiversity.\n" +
    "\n" +
    "(Note: Actual examples should reflect the complexity and specifics of the task, incorporating document-specific details for realism.)"
  summaryPrompt: WritableSignal<string> = signal(this.defaultString);


  constructor(private documentService: DocumentService, private userContextService: UserContextService, private stateManagerService: StateManagerService) {
  }


  onRequest() {
    if (this.documentID == undefined)
      return;
    this.stateManagerService.wheeWindow.set(true);
    this.documentService.requestSummary(this.userContextService.getUserID()(), this.documentID, this.summaryPrompt())
      .subscribe({
        next: (response) => {
          console.log('Job created successfully', response);

          setTimeout(() => {
            this.closeModal.emit(true)
            this.stateManagerService.wheeWindow.set(false);
          }, 10000); // Wait for 10 seconds

        },
        error: (error) => {
          console.error('An error occurred while creating the job:', error);
          this.closeModal.emit(false)
          this.stateManagerService.wheeWindow.set(false);
        }
      });
  }

  onCancel() {
    this.closeModal.emit(false)
  }


}
