import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Search,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <span className="text-6xl mb-4 block">🇳🇵</span>
        <h1 className="text-4xl font-bold mb-4">
          Digital Disaster Relief Request & Coordination System
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Nepal's official platform for disaster relief coordination. Submit
          requests, track status, and coordinate response efforts.
        </p>
        {!user && (
          <div className="flex gap-4 justify-center">
            <Link to="/auth/login">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="outline" size="lg">
                Register
              </Button>
            </Link>
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Submit Request</CardTitle>
            <CardDescription>
              Report disaster damage and request relief assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/submit">
              <Button className="w-full cursor-pointer">Submit Request</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Search className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Track Request</CardTitle>
            <CardDescription>
              Check the status of your submitted requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/track" search={{ id: undefined }}>
              <Button className="w-full cursor-pointer">Track Request</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              View your requests and manage your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              profile?.role === 'admin' ? (
                <Link to="/admin">
                  <Button className="w-full cursor-pointer">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button className="w-full cursor-pointer">Go to Dashboard</Button>
                </Link>
              )
            ) : (
              <Link to="/auth/login">
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="bg-muted/50 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Emergency Contact</h3>
            <p className="text-muted-foreground">
              For immediate life-threatening emergencies, please contact local
              emergency services directly. This platform is for coordinated
              relief request management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
