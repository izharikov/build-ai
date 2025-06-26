import { useEffect, useState } from 'react';
import { streamPage } from '@page-builder/core';

type StreamResult = ReturnType<typeof streamPage>;

export default function useStream(stream: StreamResult | null) {
  const [data, setData] = useState<Record<string, any>>({});
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!stream) return;

    const reader = stream.getReader();

    const readStream = async () => {
      try {
        let result = await reader.read();
        while (!result.done) {
          console.log('Received chunk:', result.value);
          if (result.value.type === 'data-reasoning-step') {

          }
          result = await reader.read();
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        reader.releaseLock();
      }
    };

    readStream();

    return;
  }, [stream]);

  return { data, error };
}