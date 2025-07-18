import { UIMessage } from 'ai';
import { Box, Text } from 'ink';
import { useMessageData } from '@/lib/react/useMessageData';

import { ChooseStepResponse, PageResponseStream } from '@page-builder/core';

export function AgentMessage({ message }: { message: UIMessage }) {
    const step = useMessageData<ChooseStepResponse>(message, 'step');
    const page = useMessageData<PageResponseStream>(message, 'page');

    return (
        <>
            {/* <Text color="grey">
                {'Debug:'} {JSON.stringify({ message, step, page })}
            </Text> */}
            {step?.step === 'refine' && (
                <Text color="blue">
                    {`A: `} {step.question}
                </Text>
            )}
            {step?.step === 'generate' && (
                <>
                    <Text color="blue">{`A: Page is generated`}</Text>
                    <Box>
                        <Text>{JSON.stringify(page)}</Text>
                    </Box>
                </>
            )}
        </>
    );
}
