'use client'

import { Calendar, ClipboardList, FileUser, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { signOut } from '@/lib/auth/actions'

const NAV_ITEMS = [
  { href: '/bewerbungen', label: 'Bewerbungen', icon: ClipboardList },
  { href: '/dokumente', label: 'Dokumente', icon: FileUser },
  { href: '/kalender', label: 'Kalender', icon: Calendar },
] as const

type AppSidebarProps = {
  email: string
}

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname()
  const name = email.split('@')[0]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <span className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
          Jobsuche
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <item.icon className={isActive ? 'text-amber-500' : undefined} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar className="size-8">
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium capitalize">{name}</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                  Admin
                </Badge>
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/einstellungen" />} tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <form action={signOut}>
              <SidebarMenuButton
                type="submit"
                tooltip="Log out"
                className="w-full text-destructive hover:text-destructive"
              >
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}