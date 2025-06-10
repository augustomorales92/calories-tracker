'use client'
import { supabase } from '@/lib/supabase'
import {
  BarChart3,
  Calendar,
  LogOut,
  Settings,
  Utensils,
  Weight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import Image from 'next/image'

const ButtonLink = ({
  href,
  children
}: {
  href: string
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link href={href} prefetch={true}>
      <Button variant={isActive ? 'default' : 'ghost'} size="sm">
        {children}
      </Button>
    </Link>
  )
}

export default function Header() {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
  return (
    <div className="sticky top-0 z-50 bg-background border-b h-20">
      <div className="flex items-center justify-between p-4">
        <Image
          src="/app-logo.png"
          alt="Logo"
          width={100}
          height={100}
          className="w-12 h-12"
        />
        <div className="flex gap-2">
          <ButtonLink href="/">
            <Calendar className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/database">
            <Utensils className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/progress">
            <BarChart3 className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/weight">
            <Weight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/settings">
            <Settings className="h-4 w-4" />
          </ButtonLink>

          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
