
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Notification = {
  id: string;
  message: string;
  time: string;
};

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', message: 'Welcome to ArtiJam!', time: '1 hour ago' },
    { id: '2', message: 'Your product was viewed 5 times today', time: '2 hours ago' }
  ]);

  const handleNotificationClick = (id: string) => {
    toast.success('Notification marked as read');
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    toast.success('All notifications cleared');
    setNotifications([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-artijam-purple opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-artijam-purple"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAllNotifications} 
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Clear all
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className="p-4 border-b last:border-0 cursor-pointer dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
