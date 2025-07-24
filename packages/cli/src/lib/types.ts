export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export type DataState = 'loading' | 'streaming' | 'done';
