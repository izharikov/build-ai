import { useEffect, useState } from 'react';

export type StepType = {
    name: string;
    execute: () => Promise<void>;
};

export type StepUI = {
    name: string;
    status?: 'loading' | 'done' | 'error';
};

export function useStartSteps(actualSteps: StepType[]) {
    const [steps, setSteps] = useState<StepUI[]>(
        actualSteps.map((x) => ({ name: x.name })),
    );

    const [error, setError] = useState<Error>();

    useEffect(() => {
        function wrapSetStep(index: number, status: StepUI['status']) {
            setSteps((prev) => {
                const newSteps = [...prev];
                newSteps[index].status = status;
                return newSteps;
            });
        }

        async function runSteps() {
            let failed = false;
            for (let i = 0; i < actualSteps.length; i++) {
                const index = i;
                const step = actualSteps[index];
                wrapSetStep(index, 'loading');
                await step
                    .execute()
                    .then(() => {
                        wrapSetStep(index, 'done');
                    })
                    .catch((e) => {
                        wrapSetStep(index, 'error');
                        failed = true;
                        setError(e as Error);
                    });
                if (failed) {
                    break;
                }
            }
        }

        runSteps();
    }, []);
    return { steps, error };
}
