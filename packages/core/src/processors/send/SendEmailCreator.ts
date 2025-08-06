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
            const layoutComponent = components[i];
            const row = {
                id: randomUUID(),
                uniqueId: randomUUID(),
                type: layoutComponent.name,
                slots: [],
            } as SendRow;
            const content = Object.entries(layoutComponent.children);
            for (let j = 0; j < content.length; j++) {
                const [placeholder, itemComponent] = content[j];
                const type = mapPlaceholderToType(placeholder);
                row.slots.push({
                    id: randomUUID(),
                    uniqueId: randomUUID(),
                    type,
                    components: itemComponent.map((child) => {
                        const existingDs = {
                            ...child.datasource,
                            fields: { ...child.datasource?.fields },
                        };
                        for (const k in existingDs.fields) {
                            if (k.startsWith('__type')) {
                                delete existingDs.fields[k];
                            }
                        }
                        const ds = SendPageCreator.applyComponentOptions(
                            existingDs.fields ?? {},
                            child.name,
                        );
                        return {
                            id: randomUUID(),
                            uniqueId: randomUUID(),
                            type: child.name,
                            ...ds,
                        };
                    }),
                });
            }
            context.result.json.rows.push(row);
            context.result.mobile.rows.push(row);
        }
    }

    public static get defaultResultOptions(): Record<string, unknown> {
        return {
            text_line_height: '1.3',
            font_size: 16,
            // font_family: 'Arial, Helvetica, sans-serif',
            font_family: 'Verdana, Geneva, sans-serif',
            color: '#3f3535',
            background_image: '',
            background_repeat: 'no-repeat',
            bg_color: 'transparent',
            title: '',
            retina_images: false,
            newsletterWidth: null,
            borderWidth: 0,
            structureWidth: 600,
            structureAlignment: 'flex-start',
            borderColor: '#3f3535',
            border: {},
            link_settings: {
                link_color: '#337ab7',
                link_font_family: 'Arial, Helvetica, sans-serif',
                link_font_size: 16,
                link_font_style: 'normal',
                link_font_weight: 'normal',
                link_text_decoration: 'none',
            },
            editor3: true,
        };
    }

    static getDefaultComponentOptions(type: string): Record<string, unknown> {
        if (type === 'text') {
            return {
                padding: 10,
            };
        }
        if (type === 'social_share') {
            return {
                facebook: true,
                twitter: true,
                googleplus: false,
                linkedin: true,
            };
        }

        if (type === 'social_follow') {
            return {
                style: 'default',
                spacing: 2,
                alignment: 'center',
                facebook: '',
                twitter: '',
                instagram: '',
                pinterest: null,
                googleplus: null,
                youtube: null,
                linkedin: null,
                tumblr: null,
            };
        }

        return {};
    }

    static applyComponentOptions(
        datasource: Record<string, unknown>,
        type: string,
    ) {
        if (type === 'image') {
            const alt = datasource.alt;
            if (alt) {
                datasource.alt = alt;
                datasource.src =
                    datasource.currentSrc =
                    datasource.originalSrc =
                        `https://placehold.co/600x400?text=${alt}`;
                datasource.loading = false;
                datasource.imageType = 'image/jpeg';
            }
        }
        return {
            ...datasource,
            ...SendPageCreator.getDefaultComponentOptions(type),
        };
    }
}
