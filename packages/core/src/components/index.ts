export type Component = {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  datasource?: Datasource;
  placement: {
    allowedParentPlaceholders: string[];
    allowedChildPlaceholders: string[];
  };
};

export type Datasource = {
  name: string;
  fields: Field[];
};

export type Field = {
  name: string;
  type:
    | 'text'
    | 'number'
    | 'image'
    | 'checkbox'
    | 'select'
    | 'multi-select'
    | 'rte'
    | 'date';
  options?: {
    label: string;
    value: string;
  }[];
};

export interface ComponentsProvider {
  getComponents(): Component[];
}
