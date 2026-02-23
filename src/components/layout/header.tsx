import { Link, useRouter } from '@tanstack/react-router'
import { Home, FileText, Search, LayoutDashboard, Shield, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
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
            <>
              <span className="text-sm text-muted-foreground">{profile?.full_name}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
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
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
