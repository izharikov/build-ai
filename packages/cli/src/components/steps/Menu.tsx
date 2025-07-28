import { Select } from '@inkjs/ui';
import { Box, Spacer, Text } from 'ink';
import { useEffect, useState } from 'react';

export type MenuOption = 'new' | 'list' | 'help';

export function Menu({
    setOption,
}: {
    setOption: (option: MenuOption) => void;
}) {
    const [value, setValue] = useState<string | undefined>();

    useEffect(() => {
        if (value) {
            setOption(value as MenuOption);
        }
    }, [value]);

    return (
        <>
            <Box flexDirection="column" gap={1} height={10}>
                <Select
                    options={[
                        {
                            label: '1. Create a new page',
                            value: 'new',
                        },
                        {
                            label: '2. List previously generated pages',
                            value: 'list',
                        },
                        {
                            label: '3. Help',
                            value: 'help',
                        },
                    ]}
                    onChange={setValue}
                />
            </Box>
            <Spacer />
            <Box borderTopColor="gray" borderTop>
                <Text color="gray">Please select the option.</Text>
            </Box>
        </>
    );
}
