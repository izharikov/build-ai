import { ComponentsProvider, Component } from '../index';

export class SendComponentsProvider implements ComponentsProvider {
    async getComponents(): Promise<Component[]> {
        const fullWidthPlaceholders = ['full_width'];
        const halfWidthPlaceholders = ['half_1', 'half_2'];
        const twoThirdsRightPlaceholders = ['one_third', 'two_thirds'];
        const twoThirdsLeftPlaceholders = ['two_thirds', 'one_third'];
        const threeOneThirdsPlaceholders = [
            'one_third_1',
            'one_third_2',
            'one_third_3',
        ];
        const fourOneFourthsPlaceholders = [
            'one_fourth_1',
            'one_fourth_2',
            'one_fourth_3',
            'one_fourth_4',
        ];

        const itemsPlaceholders = [
            ...fullWidthPlaceholders,
            ...halfWidthPlaceholders,
            ...twoThirdsRightPlaceholders,
            ...twoThirdsLeftPlaceholders,
            ...threeOneThirdsPlaceholders,
            ...fourOneFourthsPlaceholders,
        ];

        const componentPlacement = {
            allowedParentPlaceholders: itemsPlaceholders,
            allowedChildPlaceholders: [],
        };

        return [
            {
                id: 'FULL',
                name: 'FULL',
                description: 'Full Width Container',
                placement: {
                    allowedParentPlaceholders: ['__main__'],
                    allowedChildPlaceholders: fullWidthPlaceholders,
                },
            },
            {
                id: 'HALF',
                name: 'HALF',
                description: 'Half Width Container',
                placement: {
                    allowedParentPlaceholders: ['__main__'],
                    allowedChildPlaceholders: halfWidthPlaceholders,
                },
            },
            {
                id: 'TWO_THIRDS_RIGHT',
                name: 'TWO_THIRDS_RIGHT',
                description: 'Two Thirds Right',
                placement: {
                    allowedParentPlaceholders: ['__main__'],
                    allowedChildPlaceholders: twoThirdsRightPlaceholders,
                },
            },
            {
                id: 'TWO_THIRDS_LEFT',
                name: 'TWO_THIRDS_LEFT',
                description: 'Two Thirds Left',
                placement: {
                    allowedParentPlaceholders: ['__main__'],
                    allowedChildPlaceholders: twoThirdsLeftPlaceholders,
                },
            },
            {
                id: 'THREE_ONE_THIRDS',
                name: 'THREE_ONE_THIRDS',
                description: 'Three One Thirds',
                placement: {
                    allowedParentPlaceholders: ['__main__'],
                    allowedChildPlaceholders: threeOneThirdsPlaceholders,
                },
            },
            {
                id: 'FOUR_ONE_FOURTHS',
                name: 'FOUR_ONE_FOURTHS',
                description: 'Four One Fourths',
                placement: {
                    allowedParentPlaceholders: ['__main__'],
                    allowedChildPlaceholders: fourOneFourthsPlaceholders,
                },
            },
            {
                id: 'text',
                name: 'text',
                description: 'Text',
                datasource: {
                    templateId: '_',
                    name: 'Text',
                    fields: [{ name: 'text', type: 'html' }],
                },
                placement: componentPlacement,
            },
            {
                id: 'image',
                name: 'image',
                description: 'Image',
                datasource: {
                    templateId: '_',
                    name: 'Image',
                    fields: [{ name: 'image', type: 'image' }],
                },
                placement: componentPlacement,
            },
            {
                id: 'button',
                name: 'button',
                description: 'Button',
                datasource: {
                    templateId: '_',
                    name: 'Button',
                    fields: [
                        { name: 'text', type: 'text' },
                        { name: 'new_window', type: 'checkbox' },
                    ],
                },
                placement: componentPlacement,
            },
        ];
    }
}
