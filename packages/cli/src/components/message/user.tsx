import { UIMessage } from 'ai';
import { Text } from 'ink';

export function UserMessage({ message }: { message: UIMessage }) {
    const text = message.parts
        .map((part) => part.type === 'text' && part.text)
        .join('');
    return (
        <Text color="grey">
            {`U: `} {text}
        </Text>
    );
}
