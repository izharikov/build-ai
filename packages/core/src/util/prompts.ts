import fs from 'fs/promises';
import path from 'path';
import { Prompts, defaultPrompts } from '..';

const readFileOrDefault = async (parts: string[], defaultValue?: string) => {
    return await fs
        .readFile(path.join(...parts), 'utf-8')
        .catch(() => defaultValue ?? '');
};

export async function readPrompts(promptsPath: string[]): Promise<Prompts> {
    const [chooseStepSystem, generateLayoutSystem, globalContext] =
        await Promise.all([
            readFileOrDefault(
                [...promptsPath, 'chooseStep', 'system.md'],
                defaultPrompts.chooseStep.system,
            ),
            readFileOrDefault(
                [...promptsPath, 'generateLayout', 'system.md'],
                defaultPrompts.generateLayout.system,
            ),
            readFileOrDefault(
                [...promptsPath, 'globalContext.md'],
                defaultPrompts.globalContext,
            ),
        ]);

    return {
        chooseStep: {
            system: chooseStepSystem,
        },
        generateLayout: {
            system: generateLayoutSystem,
        },
        globalContext,
    };
}
