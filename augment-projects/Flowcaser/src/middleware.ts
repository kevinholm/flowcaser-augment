import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    // Demo mode - allow all routes if no Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
      // In demo mode, redirect root to dashboard
      if (req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Auth pages - redirect to dashboard if already logged in
    if (req.nextUrl.pathname.startsWith('/auth') && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Protected pages - redirect to login if not authenticated
    const protectedPaths = ['/dashboard', '/knowledge', '/bugs', '/features', '/time', '/chat', '/settings', '/notifications']
    const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

    if (isProtectedPath && !session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Root redirect
    if (req.nextUrl.pathname === '/' && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (req.nextUrl.pathname === '/' && !session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return res
  } catch (e) {
    // Demo mode fallback
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
