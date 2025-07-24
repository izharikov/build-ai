import React, { ReactNode, useState } from 'react';
import { Box, Text, useInput, Spacer } from 'ink';

interface StepProps {
    children: ReactNode;
    onBack: () => void;
}

const Step: React.FC<StepProps> = ({ children, onBack }) => {
    const [isConfirmingExit, setIsConfirmingExit] = useState(false);

    useInput((input, key) => {
        if (isConfirmingExit) {
            if (input.toLowerCase() === 'y') {
                onBack();
            } else {
                setIsConfirmingExit(false);
            }
        } else if (key.escape) {
            setIsConfirmingExit(true);
        }
    });

    return (
        <Box flexDirection="column" width="100%" minHeight={10}>
            {children}
            <Spacer />
            <Box borderTopColor="gray" borderTop>
                {isConfirmingExit ? (
                    <Text color="yellow">
                        Are you sure you want to go back? (y/n)
                    </Text>
                ) : (
                    <Text color="gray">
                        Press "esc" to go back to the menu.
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default Step;
