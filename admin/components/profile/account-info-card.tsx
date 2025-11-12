import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AccountInfoCardProps {
  profile: any
}

export function AccountInfoCard({ profile }: AccountInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Account Status</h3>
            <p className="text-sm text-muted-foreground">
              {profile.isBanned || profile.isDeleted ? (
                <span className="text-destructive font-medium">{profile.isBanned ? "Banned" : "Deleted"}</span>
              ) : (
                <span className="text-green-600 dark:text-green-500">Active</span>
              )}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium">Created At</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Last Updated</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {profile.isDeleted && profile.trashDate && (
            <div>
              <h3 className="text-sm font-medium">Account Deletion Date</h3>
              <p className="text-sm text-destructive">
                {new Date(profile.trashDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          {profile.isBanned && (
            <div>
              <h3 className="text-sm font-medium">Ban Reason</h3>
              <p className="text-sm text-destructive">{profile.banReason || "No reason provided"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
