import { Component } from '../../components';

export type PageComponent = {
    name: string;
    datasource?: {
        name: string;
        fields: Record<string, string | undefined>;
    };
    children: Record<string, PageComponent[]>;
};

export type PageResult = {
    name: string; // TODO: add name
    title: string;
    description: string;
    main: PageComponent[];
};

export type DatasourceItem = {
    _internalId: string;
    id: string | undefined;
    name: string;
    templateId: string;
    fields: Record<string, string | undefined>;
};

export type LayoutContext = {
    layout: {
        deviceId?: string;
        raw: (mailPlaceholder?: string) => string;
        datasources: DatasourceItem[];
    };
    components: Component[];
};
