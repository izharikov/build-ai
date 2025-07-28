import { DeepPartial } from '@/lib/types';
import { LayoutComponent, LayoutResult } from '@page-builder/core/processors';
import { Box, Spacer, Text } from 'ink';
import { InputMessage } from './input';
import React, { useState } from 'react';

export function BoxComponentPreview({
    component,
    placeholder,
}: {
    component: DeepPartial<LayoutComponent>;
    placeholder: string;
}) {
    const entries = Object.entries(component.children || {});
    const dsFields = Object.entries(component.datasource?.fields || {});
    return (
        <Box paddingX={2} borderStyle="round" flexDirection="column">
            <Text color="gray">{`[${placeholder}]`}</Text>
            <Text>{component.name}</Text>
            {component.datasource && (
                <Box flexDirection="column">
                    <Text>&nbsp;Name: {component.datasource.name}</Text>
                    {dsFields.length > 0 && (
                        <Box flexDirection="column" paddingX={1}>
                            {dsFields
                                .filter(
                                    ([fieldName]) =>
                                        !fieldName.startsWith('__type__'),
                                )
                                .map(([fieldName, fieldValue]) => (
                                    <Text key={fieldName}>
                                        &nbsp;&nbsp;{fieldName}: {fieldValue}
                                    </Text>
                                ))}
                        </Box>
                    )}
                </Box>
            )}
            {entries.length > 0 && (
                <Box paddingX={1} flexDirection="column">
                    {entries.map(([placeholder, value], index) => {
                        return (
                            <Box
                                key={placeholder + index}
                                flexDirection="column"
                            >
                                {value &&
                                    value.length &&
                                    value
                                        .filter((x) => x)
                                        .map((item, index) => (
                                            <BoxComponentPreview
                                                key={index}
                                                component={item!}
                                                placeholder={placeholder}
                                            />
                                        ))}
                            </Box>
                        );
                    })}
                </Box>
            )}
            <Text color="gray">{`[${placeholder}]`}</Text>
        </Box>
    );
}

function RawComponentPreview({
    component,
}: {
    component: DeepPartial<LayoutComponent>;
}) {
    const childComponents = Object.entries(component.children || {});
    const dsFields = Object.entries(component.datasource?.fields || {});
    return (
        <Box flexDirection="column" paddingLeft={2}>
            <Text>
                {`-`} {component.name}
            </Text>
            {component.datasource && (
                <Box flexDirection="column" paddingLeft={2}>
                    <Text>
                        {` - Datasource: `}
                        {component.datasource.name}
                    </Text>
                    {dsFields
                        .filter(
                            ([fieldName]) => !fieldName.startsWith('__type__'),
                        )
                        .map(([fieldName, fieldValue]) => (
                            <Text key={component.datasource!.name + fieldName}>
                                {`   - `}
                                {fieldName}: {fieldValue}
                            </Text>
                        ))}
                </Box>
            )}
            {childComponents.length > 0 && (
                <Box paddingX={1} flexDirection="column">
                    {childComponents.map(([placeholder, value], index) => {
                        return (
                            <React.Fragment key={placeholder + index}>
                                <Text color="gray">{`├── [${placeholder}]`}</Text>
                                <Box
                                    key={placeholder + index}
                                    flexDirection="column"
                                    paddingLeft={2}
                                >
                                    {value &&
                                        value.length &&
                                        value
                                            .filter((x) => x)
                                            .map((item, index) => (
                                                <RawComponentPreview
                                                    key={index}
                                                    component={item!}
                                                />
                                            ))}
                                </Box>
                            </React.Fragment>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}

export function LayoutPreview({
    id,
    layout,
    onCommand,
    hideCommands,
}: {
    id: string;
    layout: DeepPartial<LayoutResult>;
    onCommand?: (command: string, args: string[]) => void;
    hideCommands?: boolean;
}) {
    const components = Object.values(layout.main || {});

    const [commandSelected, setCommandSelected] = useState<boolean>(false);

    return (
        <Box flexDirection="column" paddingY={1}>
            <Text>{layout.title}</Text>
            <Text>
                {`├── `}
                {layout.description}
            </Text>
            <Box flexDirection="column" paddingX={2}>
                <Text color="gray">{`├── [main]`}</Text>
                {components.length > 0 &&
                    components
                        .filter((x) => x)
                        .map((component, index) => (
                            <RawComponentPreview
                                key={'main-' + index}
                                component={component!}
                            />
                        ))}
            </Box>
            <Spacer />
            {!hideCommands && !commandSelected && (
                <Box flexDirection="column" paddingY={1}>
                    <InputMessage
                        placeholder="Type / to choose command"
                        onCommand={(command) => {
                            if (command == 'chat') {
                                onCommand?.('chat', [id]);
                                setCommandSelected(true);
                            }
                        }}
                        commands={[
                            {
                                name: 'chat',
                                description: 'Start a chat (to edit layout)',
                            },
                        ]}
                    />
                </Box>
            )}
        </Box>
    );
}
