import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TodosActions } from './todo.actions';
import { map, mergeMap, switchMap, catchError } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { TodosDbService } from './todos-db';
import { TodoItem } from './todo.model';

@Injectable()
export class TodosEffects {
  private actions$ = inject(Actions);
  private db = inject(TodosDbService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.load),
      switchMap(() => from(this.db.getAll()).pipe(
        map((items: TodoItem[]) => TodosActions.loadSuccess({ items }))
      ))
    )
  );

  add$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.addRequested),
      mergeMap(({ title }) => from(this.db.add(title)).pipe(
        map((item: TodoItem) => TodosActions.add({ item }))
      ))
    )
  );

  toggle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.toggle),
      mergeMap(({ id }) => from(this.db.toggle(id)).pipe(
        map(() => ({ type: '[Todos API] Toggle Success' as const })),
        catchError(error => {
          console.error('Failed to toggle todo in database:', error);
          return of({ type: '[Todos API] Toggle Error' as const });
        })
      ))
    ), { dispatch: false }
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.update),
      mergeMap(({ id, title }) => from(this.db.update(id, title)).pipe(map(() => ({ type: '[Todos API] Update Success' as const }))))
    ), { dispatch: false }
  );

  remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.remove),
      mergeMap(({ id }) => from(this.db.remove(id)).pipe(
        map(() => TodosActions.removeSuccess({ id })),
        catchError(error => {
          console.error('Failed to remove todo from database:', error);
          return of(TodosActions.removeError({ id, error: error.message }));
        })
      ))
    )
  );

  reorder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.reorder),
      mergeMap(({ items }) => from(this.db.replaceAll(items)).pipe(map(() => ({ type: '[Todos API] Reorder Success' as const }))))
    ), { dispatch: false }
  );

  clearCompleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TodosActions.clearCompleted),
      mergeMap(() => from(this.db.clearCompleted()).pipe(map(() => ({ type: '[Todos API] Clear Completed Success' as const }))))
    ), { dispatch: false }
  );
}


