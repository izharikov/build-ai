import { Component } from '../../components';

export type LayoutComponent = {
    name: string;
    datasource?: {
        name: string;
        fields: Record<string, string | undefined>;
    };
    children: Record<string, LayoutComponent[]>;
};

export type LayoutResult = {
    name: string;
    state?: 'new' | 'saved';
    itemId?: string;
    title: string;
    description: string;
    main: LayoutComponent[];
    openLink?: string;
};

export type DatasourceItem = {
    _internalId: string;
    id: string | undefined;
    name: string;
    templateId: string;
    fields: Record<string, string | undefined>;
};

export type GeneratedLayoutContext = {
    layout: {
        deviceId?: string;
        raw: (mailPlaceholder?: string) => string;
        datasources: DatasourceItem[];
    };
    components: Component[];
};
