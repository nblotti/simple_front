import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {StateManagerService} from "../state-manager.service";

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [],
  templateUrl: './share.component.html',
  styleUrl: './share.component.css'
})
export class ShareComponent implements OnInit{

  constructor(private statemanagerService: StateManagerService){


 }
  ngOnInit(): void {
    this.statemanagerService.chatEnabled.set(false);
  }
}
