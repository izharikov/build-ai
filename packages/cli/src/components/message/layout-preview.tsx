import { DeepPartial } from '@/lib/types';
import { LayoutComponent, LayoutResult } from '@page-builder/core/processors';
import { Box, Spacer, Text } from 'ink';
import { InputMessage } from './input';

function ComponentPreview({
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
                    {entries.map(([placeholder, value]) => {
                        return (
                            <Box key={placeholder} flexDirection="column">
                                {value &&
                                    value.length &&
                                    value
                                        .filter((x) => x)
                                        .map((item, index) => (
                                            <ComponentPreview
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

export function LayoutPreview({
    layout,
}: {
    layout: DeepPartial<LayoutResult>;
}) {
    const components = Object.values(layout.main || {});
    return (
        <Box flexDirection="column" paddingY={1}>
            <Box>
                <Text italic underline>
                    Title:
                </Text>
                <Text> {layout.title}</Text>
            </Box>
            <Box>
                <Text italic underline>
                    Description:
                </Text>
                <Text> {layout.description}</Text>
            </Box>
            {/* <Box
                flexDirection="column"
                minHeight={10}
                borderStyle={'round'}
                paddingX={2}
            >
                {components.length > 0 &&
                    components
                        .filter((x) => x)
                        .map((component, index) => (
                            <ComponentPreview
                                key={index}
                                component={component!}
                                placeholder="main"
                            />
                        ))}
            </Box> */}
            <Spacer />
            <Box flexDirection="column" paddingY={2}>
                <Text color="gray">
                    Choose command (press Enter to confirm):
                </Text>
                <InputMessage
                    placeholder="Type / to choose command"
                    commands={[
                        {
                            name: 'chat',
                            description: 'Start a chat',
                        },
                        {
                            name: 'preview',
                            description: 'Preview layout',
                        },
                    ]}
                />
            </Box>
        </Box>
    );
}
