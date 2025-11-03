import { useUser } from "@stackframe/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stackClientApp } from "app/auth";
import { APP_BASE_PATH } from "app";

export function AuthButton() {
  const user = useUser();

  if (!user) {
    return (
      <Button onClick={() => window.location.assign(stackClientApp.urls.signIn)} size="lg">
        Get Started
      </Button>
    );
  }

  const getInitials = () => {
    if (user.displayName) {
      const names = user.displayName.split(" ");
      return names.map((n) => n[0]).join("");
    }
    if (user.primaryEmail) {
      return user.primaryEmail[0].toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName ?? ""} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            window.location.assign(`${APP_BASE_PATH}/profiledisplay`)
          }
        >
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            window.location.assign(`${APP_BASE_PATH}/profile-completion`)
          }
        >
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => stackClientApp.signOut()}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
