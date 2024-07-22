import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CheckinComponent } from '@flight-demo/luggage/feature-checkin';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  // imports: [CommonModule, CheckinComponent],
  // selector: '@flight-demo-root',
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'luggage';
}
