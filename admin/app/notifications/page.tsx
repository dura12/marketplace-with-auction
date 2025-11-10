import { getMockNotifications } from "@/utils/notification-data";
import { NotificationList } from "@/components/notification/notification-list";
import { Sidebar } from "@/components/sidebar";

export default function NotificationsPage() {
  const notifications = getMockNotifications();

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <Sidebar />
      <div className="flex-1 md:ml-[calc(var(--sidebar-width)-40px)] md:-mt-12 -mt-8">
        <NotificationList />
      </div>
    </div>
  );
}
