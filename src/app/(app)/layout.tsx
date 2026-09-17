import { redirect } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar email={user.email ?? ''} />
         <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden bg-transparent">
        {children}
      </SidebarInset>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}