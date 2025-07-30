import { UIMessage } from 'ai';
import { Box, Newline, Text } from 'ink';
import { useMessageData } from '@/lib/react/useMessageData';

import {
    ChooseStepResponse,
    LayoutResponseStream,
    CommandState,
} from '@page-builder/core';
import { Spinner } from '@inkjs/ui';
import { useEffect } from 'react';
import { DataState, DeepPartial } from '@/lib/types';
import { LayoutPreview } from './layout-preview';

function Command({
    command,
    state,
}: {
    command: DeepPartial<CommandState>;
    state: DataState | undefined;
}) {
    return (
        <>
            {(state === 'loading' || state === 'streaming') && (
                <Spinner label={`Executing command ${command.command}...`} />
            )}
            {state === 'done' && (
                <>
                    {command.success && (
                        <>
                            <Text color="green">{`Command ${command.command} executed successfully!`}</Text>
                            <Newline />
                            <Text>Result: {command?.result}</Text>
                        </>
                    )}
                    {!command.success && (
                        <Text color="red">
                            {`Error executing command ${command.command}: ${command?.message}`}
                        </Text>
                    )}
                </>
            )}
        </>
    );
}

export function AgentMessage({
    message,
    setFlowState,
    layoutMode = 'minimal',
}: {
    message: UIMessage;
    setFlowState?: (state: string) => void;
    layoutMode?: 'minimal' | 'full';
}) {
    const { data: command, state: commandState } = useMessageData<CommandState>(
        message,
        'command',
    );
    const { data: step } = useMessageData<ChooseStepResponse>(message, 'step');
    const { state, data: layout } = useMessageData<LayoutResponseStream>(
        message,
        'layout',
    );

    useEffect(() => {
        if (step?.step && setFlowState) {
            setFlowState(step.step);
        }
    }, [step, setFlowState]);

    return (
        <>
            {message.id !== 'internal' && (
                <Text color="blue">{`A [${message.id}]:`}</Text>
            )}
            {command && <Command command={command} state={commandState} />}
            {step?.step === 'refine' && (
                <Text color="blue">
                    {`A: `} {step.layoutContent} {`\n`}
                    {step.question}
                </Text>
            )}
            {step?.step === 'generate' && (
                <Box flexDirection="column">
                    {(state === 'loading' || state === 'streaming') && (
                        <Spinner label="Generating page..." />
                    )}
                    <>
                        {layout && layoutMode === 'full' && (
                            <LayoutPreview
                                id="layout"
                                layout={layout}
                                hideCommands
                            />
                        )}
                    </>
                    {state === 'done' && (
                        <Text color="green">
                            Layout generated successfully!
                        </Text>
                    )}
                </Box>
            )}
        </>
    );
}
