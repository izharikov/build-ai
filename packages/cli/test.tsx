import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { Alert, TextInput } from '@inkjs/ui';

const EchoChat = () => {
	const { exit } = useApp();
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [history, setHistory] = useState<{
		role: 'user' | 'bot';
		text: string;
	}[]>([]);

	useInput((inputKey, key) => {
		if (key.escape) exit();
	});

	const handleSubmit = () => {
		if (input.trim() === '') return;

		const userMessage = { role: 'user' as const, text: input };
		const botMessage = { role: 'bot' as const, text: `Echo: ${input}` };

		setHistory([...history, userMessage, botMessage]);
		setInput('');
		console.log('User:', input);
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyanBright">Echo Chat CLI</Text>
			<Box flexDirection="column" marginTop={1} marginBottom={1}>
				{history.map((msg, index) => (
					<Box key={index}>
						<Alert
							variant={msg.role === 'user' ? 'info' : 'success'}
							children={`${msg.role === 'user' ? 'You' : 'Bot'}: ${msg.text}`}
						/>
					</Box>
				))}
			</Box>

			<Box>
				<Text color="green"> </Text>
				{input && <TextInput
					defaultValue={input}
					onChange={setInput}
					onSubmit={handleSubmit}
				/>}
				{!input && <TextInput onChange={setInput} onSubmit={handleSubmit} placeholder="Type a message and press Enter" />}
			</Box>
			<Text dimColor>Press Esc to quit.</Text>
		</Box>
	);
};

render(<EchoChat />);
