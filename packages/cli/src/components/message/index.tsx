import { UIMessage } from 'ai';
import { UserMessage } from './user';
import { AgentMessage } from './agent';

export function Message({ message }: { message: UIMessage }) {
    return (
        <>
            {message.role === 'user' && <UserMessage message={message} />}
            {message.role === 'assistant' && <AgentMessage message={message} />}
        </>
    );
}

export * from './input';
