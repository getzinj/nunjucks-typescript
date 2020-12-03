export interface INunjucksNode {
  children: INunjucksNode[] | undefined;
  typename: string;

  iterFields(func): void;
}
