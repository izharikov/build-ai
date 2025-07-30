import { UIMessage } from 'ai';
import { UserMessage } from './user';
import { AgentMessage } from './agent';

export function Message({
    message,
    setFlowState,
    streaming,
}: {
    message: UIMessage;
    setFlowState?: (state: string) => void;
    streaming: boolean;
}) {
    return (
        <>
            {message.role === 'user' && <UserMessage message={message} />}
            {message.role === 'assistant' && (
                <AgentMessage
                    message={message}
                    setFlowState={setFlowState}
                    streaming={streaming}
                />
            )}
        </>
    );
}

export * from './input';
