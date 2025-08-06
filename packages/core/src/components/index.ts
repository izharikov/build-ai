import fs from 'fs/promises';
import path from 'path';

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
    templateId: string;
    name: string;
    fields: Field[];
};

export type Field = {
    name: string;
    description?: string;
    type:
        | 'text'
        | 'number'
        | 'image'
        | 'checkbox'
        | 'select'
        | 'multi-select'
        | 'html'
        | 'date'
        | 'link'
        | '_unknown_';
};

export interface ComponentsProvider {
    getComponents(): Promise<Component[]>;
}

export class CachedComponentsProvider implements ComponentsProvider {
    private readonly internalComponentsProvider: ComponentsProvider;
    private folder: string;
    private forceReload: boolean;
    lastError?: Error;

    constructor(
        internalComponentsProvider: ComponentsProvider,
        folder: string | string[],
        forceReload: boolean = false,
    ) {
        this.internalComponentsProvider = internalComponentsProvider;
        this.folder = Array.isArray(folder) ? path.join(...folder) : folder;
        this.forceReload = forceReload;
    }

    async getComponents(): Promise<Component[]> {
        if (this.forceReload) {
            return await this.loadAndStoreComponents();
        }
        try {
            const components = await fs.readFile(
                path.join(this.folder, 'components.json'),
                'utf-8',
            );
            return JSON.parse(components);
        } catch (e) {
            this.lastError = e;
            return await this.loadAndStoreComponents();
        }
    }

    private async loadAndStoreComponents(): Promise<Component[]> {
        const components =
            await this.internalComponentsProvider.getComponents();
        await fs.mkdir(this.folder, { recursive: true });
        await fs.writeFile(
            path.join(this.folder, 'components.json'),
            JSON.stringify(components, null, 2),
            'utf-8',
        );
        this.forceReload = false;
        return components;
    }
}

export * from './sitecore/SitecoreGraphqlAuthoringComponentsProvider';
export * from './sitecore/HardcodedSitecoreComponentsProvider';
