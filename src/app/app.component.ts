import { Component } from '@angular/core';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserDashboardComponent],
  template: `<app-user-dashboard></app-user-dashboard>`,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AppComponent {}
