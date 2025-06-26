import { streamPage, ModelMessage } from '@page-builder/core';

async function main() {
    const messages: ModelMessage[] = [];
    const chat = {
        messages: messages,
    };

    // do {

    // } while ()

    const stream = await streamPage(chat);
    
    const reader = stream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log(value);
    }
}