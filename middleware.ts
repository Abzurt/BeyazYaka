import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return i18n.defaultLocale;

  const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
  return i18n.locales.includes(preferred as any) ? preferred : i18n.defaultLocale;
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }

  const isOnAdmin = pathname.startsWith(`/${request.nextUrl.pathname.split('/')[1]}/admin`)

  // Minimal admin check (will rely on server components or layout for full check if this fixes 500)
  if (isOnAdmin) {
    // For now, let's just allow it or redirect to login if we can't get session easily without NextAuth wrapper
    // But the goal is to see if the 500 goes away.
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/|static|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)'],
}
