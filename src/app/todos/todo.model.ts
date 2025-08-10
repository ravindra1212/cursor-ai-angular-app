export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodosState {
  items: TodoItem[];
  removingIds: string[];
}


