import { APP_BASE_PATH } from "app";
import { AuthButton } from "components/AuthButton";
import { Link } from "react-router-dom";
import { Code, Menu } from "lucide-react";
import { useUser } from "@stackframe/react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Header() {
  const user = useUser();

  const navLinks = [
    { href: "/profiledisplay", label: "My Profile", auth: true },
    { href: "/discover", label: "Discover", auth: true },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <div className="glassmorphic rounded-full p-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Code className="h-8 w-8 text-purple-400" />
          <span className="text-xl font-bold">PortfolioFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks
            .filter((link) => !link.auth || (link.auth && user))
            .map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center space-x-4">
          <AuthButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">A list of navigation links.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg font-medium text-white hover:text-purple-400"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
