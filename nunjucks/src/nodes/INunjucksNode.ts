export interface INunjucksNode {
  fields;
  colno: number;
  lineno: number;
  children: INunjucksNode[] | undefined;
  typename: string;

  iterFields(func): void;
  findAll<T>(type, results?: T[]): T[];
}
