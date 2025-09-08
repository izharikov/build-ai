#!/usr/bin/env node

import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import { Alert } from '@inkjs/ui';
import { Menu } from './components/steps/Menu';
import Step from './components/steps/Step';
import { Chat } from './components/chat';
import { ListPages } from './components/list-pages';
import { StepType, useStartSteps } from './lib/react/useStartSteps';
import { StartStepUI } from './components/start-step';
import { ChatTransport, UIMessage } from 'ai';
import { initialSteps } from './start-steps';
import { LayoutResult } from '@build-ai/core/processors';
import { Storage } from '@build-ai/core/storage';
import meow from 'meow';

type AppProps = {
    steps: StepType[];
    transport: () => ChatTransport<UIMessage>;
    storage: () => Storage<LayoutResult>;
};

const App = (props: AppProps) => {
    const [menuOption, setMenuOption] = useState<
        'menu' | 'new' | 'list' | 'help'
    >('menu');
    const [error, setError] = useState<string>();

    const { steps, error: stepError } = useStartSteps(props.steps);

    useEffect(() => {
        if (stepError) {
            setError(stepError.message);
        }
    }, [stepError]);

    const initDone =
        steps.length === 0 || steps.every((x) => x.status === 'done');

    return (
        <Box flexDirection="column" padding={1}>
            <Box>
                <Text color="cyanBright">Page Builder CLI</Text>
            </Box>
            {steps.length > 0 &&
                steps.map((x, i) => (
                    <StartStepUI key={i} name={x.name} status={x.status} />
                ))}
            <Box>{error && <Alert variant="error">{error}</Alert>}</Box>
            {initDone && (
                <Box flexDirection="column" paddingY={1}>
                    {menuOption === 'menu' && (
                        <Menu setOption={setMenuOption} />
                    )}
                    {menuOption === 'new' && (
                        <Step onBack={() => setMenuOption('menu')}>
                            <Chat
                                transport={props.transport()}
                                setError={setError}
                            />
                        </Step>
                    )}
                    {menuOption === 'list' && (
                        <Step onBack={() => setMenuOption('menu')}>
                            <ListPages
                                storage={props.storage()}
                                setError={setError}
                                transport={props.transport()} // required, cause we can start editing the layout in new chat
                            />
                        </Step>
                    )}
                </Box>
            )}
        </Box>
    );
};

const cli = meow(
    `
	Usage
	  $ npx @build-ai/cli [options]

	Options
	  --config, -c  config file path (default: config.json)
`,
    {
        importMeta: import.meta, // This is required
        flags: {
            config: {
                type: 'string',
                shortFlag: 'c',
                default: 'config.json',
            },
        },
    },
);

async function start() {
    const { steps, transport, storage } = initialSteps(cli.flags.config);
    render(<App steps={steps} transport={transport} storage={storage} />);
}

start();
