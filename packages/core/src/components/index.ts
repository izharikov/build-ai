export type Component = {
    id: string;
    name: string;
    description?: string;
    instructions?: string;
    allowedPlaceholders?: string[];
}

export type Field = {
    name: string;
    type: 'text' | 'number' | 'image' | 'checkbox' | 'select' | 'multi-select' | 'rte' | 'date';
    options?: {
        label: string;
        value: string;
    }[];
}

export interface ComponentsProvider {
    getComponents(): Component[];
}
