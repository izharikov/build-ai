import { UIMessage } from 'ai';
import { Box, Spacer, Text } from 'ink';
import { useMessageData } from '@/lib/react/useMessageData';

import { ChooseStepResponse, PageResponseStream } from '@page-builder/core';
import { Spinner } from '@inkjs/ui';
import { useEffect } from 'react';

export function AgentMessage({
    message,
    setFlowState,
}: {
    message: UIMessage;
    setFlowState?: (state: string) => void;
}) {
    const { data: step } = useMessageData<ChooseStepResponse>(message, 'step');
    const { data: page, state } = useMessageData<PageResponseStream>(
        message,
        'page',
    );

    useEffect(() => {
        if (step?.step && setFlowState) {
            setFlowState(step.step);
        }
    }, [step, setFlowState]);

    return (
        <>
            {step?.step === 'refine' && (
                <Text color="blue">
                    {`A: `} {step.question}
                </Text>
            )}
            {step?.step === 'generate' && (
                <Box flexDirection="column" minHeight={13}>
                    {(state === 'loading' || state === 'streaming') && (
                        <Spinner label="Generating page..." />
                    )}
                    {state === 'done' && (
                        <Text color="green">Page generated successfully!</Text>
                    )}
                    <Spacer />
                    {/** TODO: render page preview */}
                    {/* <Text>{JSON.stringify(page, null, 2)}</Text> */}
                </Box>
            )}
        </>
    );
}
