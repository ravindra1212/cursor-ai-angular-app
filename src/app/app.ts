import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Store } from '@ngrx/store';
import { inject } from '@angular/core';
import { TodosActions } from './todos';
import { TodoInputComponent, TodoListComponent } from './todos';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [CardModule, ToastModule, ConfirmDialogModule, TodoInputComponent, TodoListComponent],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('headerEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(-20px)' }),
        animate('800ms 200ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('cardEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
        animate('700ms 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
})
export class App {
  protected title = 'todo-app';
  private readonly store = inject(Store);
  constructor() {
    this.store.dispatch(TodosActions.load());
  }
}
