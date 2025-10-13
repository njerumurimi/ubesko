import { useAuth } from 'wasp/client/auth';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { siteConfig } from "../landing-page/config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

import { MenuIcon } from "./icons/menu"
import { UserCircleIcon } from "./icons/user-circle"
import { Button } from "./ui/button"

export function UserMenuButton() {

  const { data: user, isLoading: isUserLoading } = useAuth();

  const githubUrl = siteConfig.links.github

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="link" className="p-1">
            <div className="flex items-center justify-center text-neutral-800">
              <MenuIcon className="mr-1.5 size-4 shrink-0" />
              <UserCircleIcon className="size-6 shrink-0 md:size-7 xl:size-[30px]" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-40 sm:w-48 lg:w-52"
          collisionPadding={20}
        >
          <DropdownMenuGroup>
            {user ? (
              <DropdownMenuItem className="p-0">
                <span className="w-full [&_button]:w-full [&_button]:px-2 [&_button]:py-[6px] [&_button]:text-left">
                  <Button
                    variant="ghost"
                    className="w-full px-2 py-[6px] text-left"
                    onClick={() => logout()} // can call a signUp function if needed
                  >
                    Sign Out
                  </Button>
                </span>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem className="p-0">
                  <WaspRouterLink to={routes.SignupRoute.to}>
                    <span className="w-full [&_button]:w-full [&_button]:px-2 [&_button]:py-[6px] [&_button]:text-left">
                      <Button
                        variant="ghost"
                        className="w-full px-2 py-[6px] text-left"
                      >
                        Sign Up
                      </Button>
                    </span>
                  </WaspRouterLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0">
                  <WaspRouterLink to={routes.LoginRoute.to}>
                    <span className="w-full [&_button]:w-full [&_button]:px-2 [&_button]:py-[6px] [&_button]:text-left">
                      <Button
                        variant="ghost"
                        className="w-full px-2 py-[6px] text-left"
                      >
                        Sign In
                      </Button>
                    </span>
                  </WaspRouterLink>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-0">
              <a
                href={githubUrl}
                className="w-full px-2 py-[6px]"
                target="_blank"
                rel="noreferrer"
              >
                Gift Cards
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-0">
              <a
                href={githubUrl}
                className="w-full px-2 py-[6px]"
                target="_blank"
                rel="noreferrer"
              >
                Help Center
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
