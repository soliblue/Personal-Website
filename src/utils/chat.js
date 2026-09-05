export async function streamChat(message, history, onChunk, signal) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: history.slice(-12) }),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(response.status === 429
      ? 'Too many messages. Please try again in a minute.'
      : 'The reply could not be loaded. Please try again.');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let received = false;
  const consume = (event) => {
    const payload = event.split(/\r?\n/).filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart()).join('\n');
    if (!payload || payload === '[DONE]') return;
    const data = JSON.parse(payload);
    if (data.error) throw new Error('The reply was interrupted. Please try again.');
    const text = (data.candidates?.[0]?.content?.parts || [])
      .filter(part => !part.thought).map(part => part.text || '').join('');
    if (text) { received = true; onChunk(text); }
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop();
      events.forEach(consume);
      if (done) { if (buffer.trim()) consume(buffer); break; }
    }
    if (!received) throw new Error('No reply arrived. Please try again.');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
