import {booleanAttribute, Component, EventEmitter, Input, Output} from '@angular/core';
import {faStar} from "@fortawesome/free-solid-svg-icons/faStar";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-app-favorite',
  standalone: true,
  imports: [
    FaIconComponent,
    NgStyle
  ],
  templateUrl: './app-favorite.component.html',
  styleUrl: './app-favorite.component.css'
})
export class AppFavoriteComponent {

  @Input() isFavorite? = false;
  @Output() isFavoriteChange = new EventEmitter<boolean>();

  protected readonly faStar = faStar;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    this.isFavoriteChange.emit(this.isFavorite);
  }
}
