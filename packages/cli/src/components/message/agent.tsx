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
    streaming,
    layoutScrollEnabled,
}: {
    message: UIMessage;
    setFlowState?: (state: string) => void;
    layoutMode?: 'minimal' | 'full';
    streaming: boolean;
    layoutScrollEnabled?: boolean;
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

    const text = message.parts
        .map((x) => x.type === 'text' && x.text)
        .filter((x) => x)
        .join(' ');

    return (
        <>
            <Text color="blue">{`A : ${text}`}</Text>
            {streaming && !command && step === undefined && (
                <Spinner label="Loading..." />
            )}
            {command && <Command command={command} state={commandState} />}
            {step?.step === 'refine' && (
                <Text color="blue">
                    {`A: `} [{step.layoutContent}] {`\n`}
                    {step.question}
                </Text>
            )}
            <>
                {layout && layoutMode === 'full' && (
                    <LayoutPreview
                        id="layout"
                        layout={layout}
                        hideCommands
                        disabled={!layoutScrollEnabled}
                    />
                )}
            </>
            {step?.step === 'generate' && (
                <Box flexDirection="column">
                    {(state === 'loading' || state === 'streaming') && (
                        <Spinner label="Generating page..." />
                    )}
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
