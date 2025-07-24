import { ResultProcessor } from '..';
import { PLACEHOLDER_SEPARATOR } from '../../helpers/constants';
import { LayoutResult, GeneratedLayoutContext, DatasourceItem } from './types';
import { randomUUID } from 'crypto';

type Rendering = {
    uid: string;
    id: string;
    placeholder: string;
    datasourceRef: string | undefined;
    after: string | undefined;
};

type XmlVal =
    | {
          value: string | undefined;
      }
    | {
          id: string | undefined;
      };

function val(x: XmlVal) {
    if ('id' in x && x.id) {
        return '{' + x.id.toUpperCase() + '}';
    }
    return 'value' in x ? (x.value ?? undefined) : undefined;
}

function xmlTag(
    tag: string,
    attributes: ({
        key: string;
    } & XmlVal)[] = [],
    intend: number = 0,
) {
    return `${' '.repeat(intend)}<${tag} ${attributes
        .filter((x) => x['value'] || x['id'])
        .map((x) => `${x.key}="${val(x)}"`)
        .join(' ')} />`;
}

export class SitecorePageToLayoutProcessor<
    TResult extends LayoutResult,
    TContext extends GeneratedLayoutContext,
> implements ResultProcessor<TResult, TContext>
{
    process(page: TResult, context: TContext): Promise<void> {
        context.layout = {
            raw: () => '',
            datasources: [],
        };
        const queue = page.main.map((x) => ({
            component: x,
            placeholder: ['__main__'],
        }));
        const renderings: Rendering[] = [];
        const datasourceNames = new Map<string, number>();
        function getUniqueDatasourceName(name: string): string {
            const fixedName = name.replace(/[^a-zA-Z0-9_]/g, '-').toLowerCase();
            const count = datasourceNames.get(fixedName) ?? 0;
            if (count > 0) {
                datasourceNames.set(fixedName, count + 1);
                return `${fixedName}-${count}`;
            }
            datasourceNames.set(fixedName, 1);
            return fixedName;
        }
        while (queue.length > 0) {
            const { component, placeholder } = queue.shift()!;
            const realComponent = context.components.find(
                (x) => x.name === component.name,
            )!;
            let ds: DatasourceItem | undefined = undefined;
            if (component.datasource && realComponent.datasource?.templateId) {
                const existingDs = { ...component.datasource };
                for (const k in existingDs.fields) {
                    if (k.startsWith('__type')) {
                        delete existingDs.fields[k];
                    }
                }
                ds = {
                    _internalId: randomUUID(),
                    id: undefined,
                    templateId: realComponent.datasource?.templateId,
                    ...existingDs,
                    name: getUniqueDatasourceName(component.datasource.name),
                };
                context.layout.datasources.push(ds);
            }
            const pl =
                (placeholder.length > 1 ? PLACEHOLDER_SEPARATOR : '') +
                placeholder.join('/');
            renderings.push({
                uid: randomUUID(),
                id: realComponent.id,
                placeholder: pl,
                datasourceRef: ds?._internalId,
                after: renderings.findLast((x) => x.placeholder === pl)?.uid,
            });
            if (!component.children) {
                continue;
            }
            for (const child of Object.keys(component.children)) {
                for (const childComponent of component.children[child]) {
                    queue.push({
                        component: childComponent,
                        placeholder: [...placeholder, child],
                    });
                }
            }
        }
        context.layout.raw = (mailPlaceholder?: string) => {
            const deviceId =
                context.layout.deviceId ??
                '{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}';
            return `<r
	xmlns:p="p"
	xmlns:s="s" p:p="1">
  <d id="${deviceId}">
${renderings
    .map((x) => {
        const ds = context.layout.datasources.find(
            (ds) => ds._internalId === x.datasourceRef,
        );
        const ph = x.placeholder.replace('__main__', mailPlaceholder ?? 'main');
        return xmlTag(
            'r',
            [
                { key: 's:id', id: x.id },
                { key: 'uid', id: x.uid },
                {
                    key: 'p:after',
                    value: x.after && `r[@uid='{${x.after.toUpperCase()}}']`,
                },
                { key: 'p:before', value: x.after ? undefined : '*' },
                { key: 's:ds', id: ds?.id },
                { key: 's:ph', value: ph },
            ],
            4,
        );
    })
    .join('\n')}
  </d>
</r>`;
        };
        return Promise.resolve();
    }
}
