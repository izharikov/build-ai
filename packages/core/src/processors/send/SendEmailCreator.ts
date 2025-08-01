import { LayoutResult, ResultProcessor } from '..';
import { SendLayoutContext, SendRow } from './types';
import { randomUUID } from 'crypto';

function mapPlaceholderToType(placeholder: string) {
    return placeholder
        .replace('_width', '')
        .replace('_1', '')
        .replace('_2', '')
        .replace('_3', '')
        .replace('_4', '')
        .toUpperCase();
}
export class SendPageCreator<
    TResult extends LayoutResult,
    TContext extends SendLayoutContext,
> implements ResultProcessor<TResult, TContext>
{
    async process(result: TResult, context: TContext): Promise<void> {
        const components = result.main;
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const row = {
                id: randomUUID(),
                uniqueId: randomUUID(),
                type: component.name,
                slots: [],
            } as SendRow;
            const content = Object.entries(component.children);
            for (let j = 0; j < content.length; j++) {
                const [placeholder, children] = content[j];
                const type = mapPlaceholderToType(placeholder);
                row.slots.push({
                    id: randomUUID(),
                    uniqueId: randomUUID(),
                    type,
                    components: children.map((child) => {
                        const existingDs = { ...child.datasource };
                        for (const k in existingDs.fields) {
                            if (k.startsWith('__type')) {
                                delete existingDs.fields[k];
                            }
                        }
                        return {
                            id: randomUUID(),
                            uniqueId: randomUUID(),
                            type: child.name,
                            ...existingDs.fields,
                        };
                    }),
                });
            }
            context.result.json.rows.push(row);
            context.result.mobile.rows.push(row);
        }
    }
}
