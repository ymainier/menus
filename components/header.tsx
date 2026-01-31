"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/components/breadcrumb-context";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
}

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const { items } = useBreadcrumb();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/signin");
    router.refresh();
  };

  return (
    <header className="border-b">
      <div className="container max-w-2xl mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            Menus
          </Link>
          {items.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {items.map((item, index) => (
                  <span key={index} className="contents">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === items.length - 1 ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href!}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        {/* Mobile dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/plans">Plans</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/meals">Meals</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/tags">Tags</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Desktop navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/plans">Plans</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/meals">Meals</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/tags">Tags</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            title={user.email}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
