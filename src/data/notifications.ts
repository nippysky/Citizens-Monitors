export type NotificationKind = "result" | "incident" | "update" | "announcement";

export type NotificationItem = {
  id: string;
  title: string;
  actorLabel?: string;
  location?: string;
  timeAgo: string;
  kind: NotificationKind;
  isUnread?: boolean;
  body: string[];
};

export const USE_EMPTY_NOTIFICATIONS_DEV = true;

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New result uploaded for Awka south.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "result",
    isUnread: true,
    body: [
      "A new election result has just been uploaded for Awka South.",
      "The update was submitted by a verified observer attached to PU 024, Alimosho.",
      "Open this notification to review the latest figures and monitor the situation as new field activity comes in.",
    ],
  },
  {
    id: "notif-2",
    title: "New result uploaded for Awka south.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "result",
    isUnread: true,
    body: [
      "Another verified result entry has been submitted for Awka South.",
      "This helps keep your election overview updated in near real time.",
      "Review the details to stay aligned with the most recent field reports.",
    ],
  },
  {
    id: "notif-3",
    title: "Sensitive ballot boxes have been breached.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "incident",
    isUnread: true,
    body: [
      "An incident has been reported involving sensitive ballot boxes at the polling unit.",
      "This notification was triggered from a verified observer report.",
      "Please review the report details promptly and follow the latest updates tied to this incident.",
    ],
  },
  {
    id: "notif-4",
    title: "Polling station opened at 8:05 AM. Booth active.",
    actorLabel: "Observer @",
    location: "PU 024, Alimosho",
    timeAgo: "2 mins ago",
    kind: "update",
    isUnread: false,
    body: [
      "The polling station has officially opened and booth activity is now underway.",
      "Observers in the area have marked the polling unit as active.",
      "You can open this update to continue following operational reports from the field.",
    ],
  },
  {
    id: "notif-5",
    title: "Update: Citizen Monitor will be hosting an event",
    timeAgo: "1 hr ago",
    kind: "announcement",
    isUnread: false,
    body: [
      "We’re excited to announce that Citizen Monitor will be hosting an upcoming event dedicated to our mobile app and the growing community of active citizens using it.",
      "This event will provide a deep dive into how the mobile app works, including how to track live and upcoming elections, access verified reports, explore news from multiple trusted sources, and learn how to contribute as a citizen monitor.",
      "Attendees will also get early insights into new features we are working on, along with guidance on how to use the platform more effectively to promote transparency and accountability in Nigeria’s political landscape.",
      "Whether you’re already using the app or just getting started, this event is designed to help you stay informed, engaged, and empowered.",
    ],
  },
];

export const emptyNotifications: NotificationItem[] = [];

export function getDevNotifications(): NotificationItem[] {
  return USE_EMPTY_NOTIFICATIONS_DEV ? emptyNotifications : mockNotifications;
}

export function getNotificationById(id: string): NotificationItem | undefined {
  return mockNotifications.find((item) => item.id === id);
}