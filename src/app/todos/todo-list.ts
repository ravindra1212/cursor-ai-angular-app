import { Component, Signal, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectRemainingCount, selectTodos } from './todo.selectors';
import { TodosActions } from './todo.actions';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DragDropModule } from 'primeng/dragdrop';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { TodoItem } from './todo.model';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger, keyframes, state } from '@angular/animations';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.scss'],
  imports: [CommonModule, FormsModule, CheckboxModule, ButtonModule, DragDropModule, InputTextModule, SelectButtonModule, TagModule, TooltipModule, RippleModule, PaginatorModule],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('itemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 0, transform: 'translateX(30px)' }))
      ])
    ]),
    trigger('itemHover', [
      state('normal', style({ transform: 'translateY(0)', boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.06)' })),
      state('hovered', style({ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.12), 0 6px 15px rgba(0,0,0,0.08)' })),
      transition('normal <=> hovered', [
        animate('200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)')
      ])
    ]),
    trigger('checkboxAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('200ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('tagAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('toolbarAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('editAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class TodoListComponent {
  private readonly store = inject(Store);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  todos!: Signal<TodoItem[]>;
  remaining!: Signal<number>;
  editingId = signal<string | null>(null);
  editTitle = signal('');
  hoveredId = signal<string | null>(null);
  private dragSourceIndex: number | null = null;
  filter = signal<'all' | 'open' | 'done'>('all');
  filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Done', value: 'done' },
  ];
  rows = 5;
  first = signal(0);

  constructor() {
    this.todos = this.store.selectSignal(selectTodos);
    this.remaining = this.store.selectSignal(selectRemainingCount);
  }

  toggle(id: string): void {
    this.store.dispatch(TodosActions.toggle({ id }));
  }

  remove(id: string): void {
    this.store.dispatch(TodosActions.remove({ id }));
  }

  clearCompleted(): void {
    this.store.dispatch(TodosActions.clearCompleted());
  }

  beginEdit(id: string, current: string): void {
    this.editingId.set(id);
    this.editTitle.set(current);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editTitle.set('');
  }

  commitEdit(id: string): void {
    const value = this.editTitle().trim();
    if (value) {
      this.store.dispatch(TodosActions.update({ id, title: value }));
      this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Todo updated' });
    }
    this.cancelEdit();
  }

  onDragStart(index: number): void {
    this.dragSourceIndex = index;
  }

  onItemDrop(targetIndex: number): void {
    const sourceIndex = this.dragSourceIndex;
    this.dragSourceIndex = null;
    if (sourceIndex === null || sourceIndex === targetIndex) return;
    const current = [...(this.todos() || [])];
    const [moved] = current.splice(sourceIndex, 1);
    current.splice(targetIndex, 0, moved);
    this.store.dispatch(TodosActions.reorder({ items: current }));
    this.messages.add({ severity: 'info', summary: 'Reordered', detail: 'List updated' });
  }

  filteredTodos(): TodoItem[] {
    const all = this.todos() || [];
    switch (this.filter()) {
      case 'open':
        return all.filter(t => !t.completed);
      case 'done':
        return all.filter(t => t.completed);
      default:
        return all;
    }
  }

  visibleTodos(): TodoItem[] {
    const list = this.filteredTodos();
    const start = this.first();
    return list.slice(start, start + this.rows);
  }

  onPage(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
    this.rows = event.rows ?? 10;
  }

  confirmRemove(id: string): void {
    this.confirm.confirm({
      message: 'Are you sure you want to delete this todo?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(TodosActions.remove({ id }));
        this.messages.add({ severity: 'warn', summary: 'Deleted', detail: 'Todo removed' });
      }
    });
  }
}


