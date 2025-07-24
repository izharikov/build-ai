import { UIMessage } from 'ai';
import { UserMessage } from './user';
import { AgentMessage } from './agent';

export function Message({
    message,
    setFlowState,
}: {
    message: UIMessage;
    setFlowState?: (state: string) => void;
}) {
    return (
        <>
            {message.role === 'user' && <UserMessage message={message} />}
            {message.role === 'assistant' && (
                <AgentMessage message={message} setFlowState={setFlowState} />
            )}
        </>
    );
}

export * from './input';
