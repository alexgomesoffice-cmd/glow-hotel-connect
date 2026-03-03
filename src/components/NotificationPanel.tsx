import { useState } from "react";
import { Bell, Check, Clock, Hotel, Users, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "booking" | "hotel" | "user" | "system";
}

const initialNotifications: Notification[] = [
  { id: 1, title: "New Booking", message: "Emma Wilson booked Grand Palace Hotel", time: "5 min ago", read: false, type: "booking" },
  { id: 2, title: "New Hotel Registered", message: "Oceanfront Resort has been added", time: "1 hour ago", read: false, type: "hotel" },
  { id: 3, title: "New User Signup", message: "3 new users registered today", time: "2 hours ago", read: false, type: "user" },
  { id: 4, title: "Booking Cancelled", message: "Lisa Anderson cancelled reservation", time: "3 hours ago", read: true, type: "booking" },
  { id: 5, title: "System Update", message: "Platform maintenance scheduled tonight", time: "5 hours ago", read: true, type: "system" },
];

const typeIcons = {
  booking: Calendar,
  hotel: Hotel,
  user: Users,
  system: Bell,
};

const typeColors = {
  booking: "from-primary to-accent",
  hotel: "from-purple-500 to-pink-500",
  user: "from-orange-500 to-amber-500",
  system: "from-green-500 to-emerald-500",
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

const NotificationPanel = ({ isOpen, onClose, accentColor }: NotificationPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl z-[70] animate-fade-in-down overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              const color = typeColors[notification.type];
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markRead(notification.id)}
                >
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br shrink-0", color)}>
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-medium truncate", !notification.read && "text-foreground")}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                      {!notification.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
