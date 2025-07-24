import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { Alert } from '@inkjs/ui';
import dotenv from 'dotenv';
import { StreamChatTransport } from './lib/StreamChatTransport';

import findConfig from 'find-config';

import { sitecorePageStream, loadPrompts, storage } from './config';
import { Menu } from './components/steps/Menu';
import Step from './components/steps/Step';
import { Chat } from './components/chat';
import { ListPages } from './components/list-pages';

dotenv.config({ path: findConfig('.env') ?? undefined });

const promts = await loadPrompts();
const transport = new StreamChatTransport(sitecorePageStream(promts));

const App = () => {
    const [menuOption, setMenuOption] = useState<
        'menu' | 'new' | 'list' | 'help'
    >('menu');
    const [error, setError] = useState<string>();

    return (
        <Box flexDirection="column" padding={1}>
            <Box>
                <Text color="cyanBright">Page Builder CLI</Text>
            </Box>
            <Box>{error && <Alert variant="error">{error}</Alert>}</Box>
            {menuOption === 'menu' && <Menu setOption={setMenuOption} />}
            {menuOption === 'new' && (
                <Step onBack={() => setMenuOption('menu')}>
                    <Chat transport={transport} setError={setError} />
                </Step>
            )}
            {menuOption === 'list' && (
                <Step onBack={() => setMenuOption('menu')}>
                    <ListPages storage={storage} setError={setError} />
                </Step>
            )}
        </Box>
    );
};

render(<App />);
