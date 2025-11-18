import { userNotifications } from "../index";

export function sendToUser(userId: number, event: string, data: any) {
  const queue = userNotifications.get(userId);
  if (!queue) return false;

  queue.push({ event, data });
  return true;
}
