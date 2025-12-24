import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
// import { UserNav } from "@/components/user-nav"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { NotificationPopover } from "@/components/notification-popover"

export function DashboardHeader() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="relative w-full flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8 border-primary/20 focus-visible:ring-primary"
          />
        </div>
        {/* <div className="ml-auto flex items-center space-x-2">
          <NotificationPopover />
          <ThemeToggle />
          <UserNav />
        </div> */}
      </div>
    </div>
  )
}

