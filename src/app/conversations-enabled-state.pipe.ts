import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'conversationsEnabledState',
  standalone: true
})
export class ConversationsEnabledStatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
