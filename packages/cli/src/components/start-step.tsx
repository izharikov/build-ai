import { Spinner, StatusMessage } from '@inkjs/ui';

type Props = {
    name: string;
    status?: 'loading' | 'done' | 'error';
};

export function StartStepUI(props: Props) {
    const { name, status } = props;
    return (
        <>
            {status === 'loading' && <Spinner label={name} />}
            {status === 'done' && (
                <StatusMessage variant="success">{name}</StatusMessage>
            )}
            {status === 'error' && (
                <StatusMessage variant="error">{name}</StatusMessage>
            )}
        </>
    );
}
