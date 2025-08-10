import Dexie, { Table } from 'dexie';
import { TodoItem } from './todo.model';

export class TodosDb extends Dexie {
  todos!: Table<TodoItem, string>;

  constructor() {
    super('TodosDb');
    this.version(1).stores({
      todos: 'id, title, completed'
    });
  }
}

export class TodosDbService {
  private db = new TodosDb();

  async getAll(): Promise<TodoItem[]> {
    return await this.db.todos.orderBy('id').reverse().toArray();
  }

  async add(title: string): Promise<TodoItem> {
    const trimmed = title.trim();
    const item: TodoItem = { id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, title: trimmed, completed: false };
    await this.db.todos.add(item);
    return item;
  }

  async toggle(id: string): Promise<void> {
    const t = await this.db.todos.get(id);
    if (!t) return;
    await this.db.todos.update(id, { completed: !t.completed });
  }

  async update(id: string, title: string): Promise<void> {
    await this.db.todos.update(id, { title: title.trim() });
  }

  async remove(id: string): Promise<void> {
    await this.db.todos.delete(id);
  }

  async replaceAll(items: TodoItem[]): Promise<void> {
    await this.db.transaction('readwrite', this.db.todos, async () => {
      await this.db.todos.clear();
      await this.db.todos.bulkAdd(items);
    });
  }

  async clearCompleted(): Promise<void> {
    const completed = await this.db.todos.filter(todo => todo.completed === true).toArray();
    if (completed.length) {
      const ids: string[] = completed.map(todo => todo.id);
      await this.db.todos.bulkDelete(ids);
    }
  }
}


