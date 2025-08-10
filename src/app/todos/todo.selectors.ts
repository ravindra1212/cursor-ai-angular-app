import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodosState } from './todo.model';

// Feature key must match the key used in provideStore({ todos: todosReducer })
export const selectTodosState = createFeatureSelector<TodosState>('todos');

export const selectTodos = createSelector(
  selectTodosState,
  (state) => state.items
);

export const selectRemainingCount = createSelector(
  selectTodos,
  (items) => items.filter((t) => !t.completed).length
);

 