import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, User } from "lucide-react"

interface ProfileHeaderProps {
  profile: any
  isAccountRestricted: boolean
  restrictionReason: string
}

export function ProfileHeader({ profile, isAccountRestricted, restrictionReason }: ProfileHeaderProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src={profile.image || ""} alt={profile.fullname} />
          <AvatarFallback className="text-lg">
            {profile.fullname
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            {profile.fullname}
            <Badge variant={profile.role === "superAdmin" ? "default" : "outline"}>
              {profile.role === "superAdmin" ? "Super Admin" : "Admin"}
            </Badge>
            {isAccountRestricted && (
              <Badge variant="destructive" className="ml-2">
                {restrictionReason.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{profile.phone || "No phone number provided"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{profile.role === "superAdmin" ? "Super Administrator" : "Administrator"}</span>
          </div>

          {profile.role === "superAdmin" && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Super Admin Privileges</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Manage all administrators</li>
                <li>Access to all system settings</li>
                <li>Create and manage admin accounts</li>
                <li>View system audit logs</li>
                <li>Configure global system parameters</li>
              </ul>
            </div>
          )}

          {profile.role === "admin" && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Admin Privileges</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Manage orders and customers</li>
                <li>Process refunds and payments</li>
                <li>View reports and analytics</li>
                <li>Manage product listings</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
