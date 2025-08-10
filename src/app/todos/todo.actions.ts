import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TodoItem } from './todo.model';

export const TodosActions = createActionGroup({
  source: 'Todos',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ items: TodoItem[] }>(),
    'Add Requested': props<{ title: string }>(),
    'Add': props<{ item: TodoItem }>(),
    'Toggle': props<{ id: string }>(),
    'Remove': props<{ id: string }>(),
    'Remove Success': props<{ id: string }>(),
    'Remove Error': props<{ id: string; error: string }>(),
    'Update': props<{ id: string; title: string }>(),
    'Reorder': props<{ items: TodoItem[] }>(),
    'Clear Completed': emptyProps(),
  },
});


