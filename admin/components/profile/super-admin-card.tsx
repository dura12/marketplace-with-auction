import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SuperAdminCard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>System Access</CardTitle>
        <CardDescription>Your super admin access details and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Last Login</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Access Level</h3>
              <p className="text-sm text-muted-foreground">Full System Access</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Enabled</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">API Access</h3>
              <p className="text-sm text-muted-foreground">Full Access</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
