import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TodosActions } from './todo.actions';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-todo-input',
  templateUrl: './todo-input.html',
  styleUrls: ['./todo-input.scss'],
  imports: [FormsModule, InputTextModule, ButtonModule],
  animations: [
    trigger('inputFocus', [
      state('unfocused', style({ transform: 'scale(1)', boxShadow: 'none' })),
      state('focused', style({ transform: 'scale(1.02)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' })),
      transition('unfocused <=> focused', [
        animate('200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      ])
    ]),
    trigger('buttonPulse', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('inputEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class TodoInputComponent {
  title = signal('');
  isFocused = signal(false);

  constructor(private readonly store: Store) {}

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
  }

  add(): void {
    const value = this.title().trim();
    if (!value) return;
    this.store.dispatch(TodosActions.addRequested({ title: value }));
    this.title.set('');
  }
}


