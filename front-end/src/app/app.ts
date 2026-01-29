import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { UserListComponent } from '../components/user-list/user-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html'
})


export class App {
  protected readonly title = signal('front-end');
}
