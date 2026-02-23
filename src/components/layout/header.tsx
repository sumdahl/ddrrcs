import { Link, useRouter } from '@tanstack/react-router'
import { Home, FileText, Search, LayoutDashboard, Shield, LogOut, Menu, X, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProfileDialog } from '@/components/profile/profile-dialog'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/' })
  }

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/submit', label: 'Submit Request', icon: FileText },
    { to: '/track', label: 'Track Request', icon: Search },
    ...(profile?.role === 'citizen' ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(profile?.role === 'admin' ? [
      { to: '/admin', label: 'Admin Dashboard', icon: Shield },
      { to: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
    ] : []),
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🇳🇵</span>
            <span className="font-semibold">DDRCS Nepal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {user && navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: 'text-foreground font-medium' }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{profile?.full_name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {user && navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <button
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setProfileDialogOpen(true)
                    }}
                  >
                    <User className="h-4 w-4" />
                    View Profile
                  </button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">Sign In</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <ProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={profile}
        email={user?.email}
      />
    </>
  )
}
