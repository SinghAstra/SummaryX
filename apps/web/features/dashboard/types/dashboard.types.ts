export interface UpdateTodoPayload {
  readonly id: string;
  readonly data: {
    readonly title?: string;
    readonly completed?: boolean;
  };
}
