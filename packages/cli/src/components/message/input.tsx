import { Select, TextInput } from '@inkjs/ui';
import { Box, Spacer, Text } from 'ink';
import { useState } from 'react';

type CommandOption = {
    name: string;
    description: string;
    confirmation?: boolean; // TODO: use confirmation in component
    switch?: boolean;
};

const OPTION_WIDTH = 20;

function getLabel(command: CommandOption) {
    const length = Math.max(OPTION_WIDTH - command.name.length, 1);
    return `/${command.name}${' '.repeat(length)}${command.description}`;
}

export function InputMessage({
    placeholder = 'Type your message here...',
    sendMessage,
    commands = [],
    onCommand,
    onCommandShown,
}: {
    placeholder?: string;
    sendMessage?: (message: { text: string }) => void;
    commands?: CommandOption[];
    onCommand?: (command: string) => void;
    onCommandShown?: (shown: boolean) => void;
}) {
    const [input, setInput] = useState('');
    const [commandSelected, setCommandSelected] = useState<boolean>(false);
    const [inputEnabled, setInputEnabled] = useState(true);
    const showCommands = commands.length > 0 && input.startsWith('/');
    onCommandShown?.(showCommands);
    const enteredCommand = showCommands ? input.substring(1) : '';
    const filteredCommands = showCommands
        ? commands.filter((x) => x.name.startsWith(enteredCommand))
        : [];

    const onSubmit = (val: string) => {
        if (!val || commandSelected) {
            return;
        }
        if (
            onCommand &&
            showCommands &&
            val.startsWith('/') &&
            filteredCommands.some((x) => x.name === val.substring(1))
        ) {
            // handle command
            onCommand(val.substring(1));
        } else if (sendMessage) {
            sendMessage({ text: val });
        }
    };
    return (
        <Box flexDirection="column">
            <Box borderColor="white" borderStyle="round" paddingX={1}>
                {inputEnabled && (
                    <TextInput
                        placeholder={placeholder}
                        onSubmit={
                            filteredCommands.length > 0 ? undefined : onSubmit
                        }
                        onChange={setInput}
                    />
                )}
                {!inputEnabled && <Text>{input}</Text>}
            </Box>
            {commands.length > 0 && (
                <Box minHeight={3}>
                    {showCommands && filteredCommands.length > 0 && (
                        <Select
                            options={filteredCommands.map((x) => ({
                                label: getLabel(x),
                                value: x.name,
                            }))}
                            onChange={(cmd) => {
                                const selectedCommand = filteredCommands.find(
                                    (x) => x.name === cmd,
                                );
                                setInputEnabled(
                                    selectedCommand?.switch ?? false,
                                );
                                console.log(
                                    'inputEnabled',
                                    selectedCommand?.switch ?? false,
                                );
                                setCommandSelected(true);
                                setInput('/' + cmd);
                                onSubmit('/' + cmd);
                            }}
                            visibleOptionCount={3}
                        />
                    )}
                    <Spacer />
                </Box>
            )}
        </Box>
    );
}
