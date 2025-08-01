import { BaseLayoutContext } from '../sitecore/types';

export type SendComponent = {
    id: string;
    uniqueId: string;
    type: string;
} & Record<string, unknown>;

export type SendSlot = {
    type: string;
    components: SendComponent[];
} & Record<string, unknown>;

export type SendRow = {
    slots: SendSlot[];
} & Record<string, unknown>;

export type SendLayoutContext = {
    result: {
        json: {
            rows: SendRow[];
        } & Record<string, unknown>;
        mobile: {
            rows: SendRow[];
        } & Record<string, unknown>;
    };
} & BaseLayoutContext;
