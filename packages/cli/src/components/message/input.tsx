import { Select, TextInput } from '@inkjs/ui';
import { Box, Spacer, Text } from 'ink';
import { useState } from 'react';

type CommandOption = {
    name: string;
    description: string;
    confirmation?: boolean;
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
}: {
    placeholder?: string;
    sendMessage?: (message: { text: string }) => void;
    commands?: CommandOption[];
    onCommand?: (command: string) => void;
}) {
    const [input, setInput] = useState('');
    const [commandSelected, setCommandSelected] = useState<boolean>(false);
    const showCommands = commands.length > 0 && input.startsWith('/');
    const enteredCommand = showCommands ? input.substring(1) : '';
    const filteredCommands = showCommands
        ? commands.filter((x) => x.name.startsWith(enteredCommand))
        : [];

    const onSubmit = () => {
        if (
            onCommand &&
            showCommands &&
            input.startsWith('/') &&
            filteredCommands.some((x) => x.name === enteredCommand)
        ) {
            // handle command
            onCommand(enteredCommand);
        } else if (sendMessage) {
            sendMessage({ text: input });
        }
    };
    return (
        <Box flexDirection="column">
            <Box borderColor="white" borderStyle="round" paddingX={1}>
                {!commandSelected && (
                    <TextInput
                        placeholder={placeholder}
                        onSubmit={onSubmit}
                        onChange={setInput}
                    />
                )}
                {commandSelected && <Text>{input}</Text>}
            </Box>
            {commands.length > 0 && (
                <Box minHeight={5}>
                    {showCommands && filteredCommands.length > 0 && (
                        <Select
                            options={filteredCommands.map((x) => ({
                                label: getLabel(x),
                                value: x.name,
                            }))}
                            onChange={(x) => {
                                setCommandSelected(true);
                                setInput('/' + x);
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
