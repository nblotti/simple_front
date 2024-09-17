import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string, allWords: boolean = false): string {
    if (!value) return value;
    if (allWords) {
      return value.replace(/\b\w/g, (first) => first.toLocaleUpperCase());
    } else {
      return value.charAt(0).toLocaleUpperCase() + value.slice(1);
    }
  }
}
