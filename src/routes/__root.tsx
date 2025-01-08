import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col h-screen w-screen overflow-x-hidden">
      <NavigationMenu className="max-h-10">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
            >
              <Link to="/">Stream</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to="/historico">Histórico</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to="/gerar-layout">Gerar Layout</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        {/* <TanStackRouterDevtools /> */}
      </NavigationMenu>
      <Outlet />
    </div>
  ),
});
