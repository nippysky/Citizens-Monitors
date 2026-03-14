export type NotificationItem = {
  id: string;
  title: string;
  actorLabel: string;
  location: string;
  timeAgo: string;
  kind: "result" | "incident" | "update";
  isUnread?: boolean;
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New result uploaded for Awka south.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "result",
    isUnread: true,
  },
  {
    id: "notif-2",
    title: "New result uploaded for Awka south.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "result",
    isUnread: true,
  },
  {
    id: "notif-3",
    title: "Sensitive ballot boxes have been breached.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "incident",
    isUnread: true,
  },
  {
    id: "notif-4",
    title: "Polling station opened at 8:05 AM. Booth active.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "update",
    isUnread: false,
  },
];

export const emptyNotifications: NotificationItem[] = [];