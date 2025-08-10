import { createReducer, on } from '@ngrx/store';
import { TodosActions } from './todo.actions';
import { TodoItem, TodosState } from './todo.model';

const generateId = (): string => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const initialTodosState: TodosState = {
  items: [],
  removingIds: [],
};

export const todosReducer = createReducer(
  initialTodosState,
  on(TodosActions.loadSuccess, (state, { items }): TodosState => ({ ...state, items })),
  on(TodosActions.add, (state, { item }): TodosState => ({
    ...state,
    items: [item, ...state.items],
  })),
  on(TodosActions.toggle, (state, { id }): TodosState => ({
    ...state,
    items: state.items.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
  })),
  on(TodosActions.remove, (state, { id }): TodosState => ({
    ...state,
    removingIds: [...state.removingIds, id],
  })),
  on(TodosActions.removeSuccess, (state, { id }): TodosState => ({
    ...state,
    items: state.items.filter((t) => t.id !== id),
    removingIds: state.removingIds.filter(removingId => removingId !== id),
  })),
  on(TodosActions.removeError, (state, { id }): TodosState => ({
    ...state,
    removingIds: state.removingIds.filter(removingId => removingId !== id),
  })),
  on(TodosActions.update, (state, { id, title }): TodosState => ({
    ...state,
    items: state.items.map((t) => (t.id === id ? { ...t, title: title.trim() || t.title } : t)),
  })),
  on(TodosActions.reorder, (state, { items }): TodosState => ({
    ...state,
    items,
  })),
  on(TodosActions.clearCompleted, (state): TodosState => ({
    ...state,
    items: state.items.filter((t) => !t.completed),
  })),
);


