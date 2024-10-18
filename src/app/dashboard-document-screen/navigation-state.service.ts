import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationStateService {
  private stateSubject = new BehaviorSubject<any>(null);

  setState(state: any) {
    this.stateSubject.next(state);
  }

  getState() {
    return this.stateSubject.asObservable();
  }
}
