type Presence = { isOnline: boolean; lastSeen: Date } | null | undefined;

export default function OnlineIndicator({ presence }: { presence?: Presence }) {
  const online = !!presence?.isOnline && new Date(presence.lastSeen).getTime() > Date.now() - 2 * 60 * 1000;
  return <span className={`online-indicator ${online ? 'online' : 'offline'}`}>{online ? '● онлайн' : '● офлайн'}</span>;
}
