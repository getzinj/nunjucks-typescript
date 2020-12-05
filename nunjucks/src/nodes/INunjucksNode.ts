export interface INunjucksNode {
  colno: number;
  lineno: number;
  children: INunjucksNode[] | undefined;
  typename: string;

  iterFields(func): void;
  findAll<T>(type, results?: T[]): T[];
}
