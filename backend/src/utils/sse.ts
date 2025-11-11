type SSEWriter = {
  writer: WritableStreamDefaultWriter<string>;
  queue: string[]; // buffer messages before generator starts
};

const userStreams = new Map<string, SSEWriter>();

export function sendToUser(userId: string, event: string, data: any) {
  const user = userStreams.get(userId);
  if (!user) return false;

  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  if (user.writer) {
    // Generator has started, push immediately
    user.writer.write(message);
  } else {
    // Generator hasn't yielded yet, buffer message
    user.queue.push(message);
  }

  return true;
}
