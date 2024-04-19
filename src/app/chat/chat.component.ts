import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {ScreenReadyMessage} from "./SreenReadyMessage";
import {MetaData, NgEventBus} from 'ng-event-bus';
import {v4 as uuidv4} from "uuid";

@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {


  isCollapsed = false;
  inputChat: string = "";
  inputMessage: string = "";

  private screenReadyMessages: Array<ScreenReadyMessage> = new Array<ScreenReadyMessage>()

  @ViewChild('scrollMe') private myScrollContainer: any;

  @ViewChild('dragableDiv') dragableDiv!: ElementRef;


  private isDragging: boolean = false;



  // variable pour gérer le drag & drop
  private clientDragClickX: number = 0;
  private clientDragClickY: number = 0;
  protected dynamicLeft: number = 10;
  protected dynamicTop: number = 10;

  constructor(private eventBus: NgEventBus) {


    eventBus.on("command:userquery").subscribe((meta: MetaData) => {
      let screenReadyMessage: ScreenReadyMessage = new ScreenReadyMessage(uuidv4(),
        meta.data.role, meta.data.content)
      this.screenReadyMessages.push(screenReadyMessage);

    });

    eventBus.on("command:message").subscribe((meta: MetaData) => {
      let screenReadyMessage: ScreenReadyMessage = new ScreenReadyMessage(uuidv4(),
        meta.data.role, meta.data.content)
      this.screenReadyMessages.push(screenReadyMessage);

    });

    this.screenReadyMessages.push(new ScreenReadyMessage("1", "assistant", "How can I help you"));

  }


  getMessages(): ScreenReadyMessage[] {
    this.scrollToBottom();
    return this.screenReadyMessages;

  }


  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  onKeyUp($event: KeyboardEvent) {

    this.screenReadyMessages.push(new ScreenReadyMessage("1", "assistant", this.inputMessage));

  }



  /*
  * Drag management functions
  *
  * */

  startDrag($event: MouseEvent) {
    console.log("start dragging");
    this.isDragging = true;
    this.clientDragClickX = $event.clientX;
    this.clientDragClickY = $event.clientY;

  }

  endDrag() {
    this.isDragging = false;
  }

  drag($event: MouseEvent) {
    console.log(this.dynamicLeft);
    console.log($event);
    if (this.isDragging) {
      this.dynamicLeft = parseInt(this.dragableDiv.nativeElement.style.left, 10) + ($event.clientX - this.clientDragClickX);
      this.clientDragClickX = $event.clientX
      console.log(this.dynamicLeft);
      this.dynamicTop = parseInt(this.dragableDiv.nativeElement.style.top, 10) + ($event.clientY - this.clientDragClickY);
      this.clientDragClickY = $event.clientY
    }
  }


  protected readonly onmouseleave = onmouseleave;

  onResize($event: any) {
    console.log("resizing");
  }
}

