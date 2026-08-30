import { ShellNav, type NavItem } from "@/components/dashboard/shell-nav";
import { SignOutButton } from "@/components/sign-out-button";

export function Shell({
  nav,
  children,
}: {
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r px-4 py-6 lg:flex">
        <span className="px-3 text-lg font-semibold tracking-tight">
          Acme Mind
        </span>
        <div className="mt-8 flex-1">
          <ShellNav items={nav} orientation="vertical" />
        </div>
        <div className="border-t pt-4">
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4 lg:px-10">
          <span className="text-lg font-semibold tracking-tight lg:hidden">
            Acme Mind
          </span>
          <div className="hidden lg:block" />
          <SignOutButton />
        </header>

        <div className="border-b px-6 py-3 lg:hidden">
          <ShellNav items={nav} orientation="horizontal" />
        </div>

        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
