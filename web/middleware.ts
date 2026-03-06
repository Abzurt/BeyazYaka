import NextAuth from "next-auth"
import authConfig from "./lib/auth.config"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const { auth } = NextAuth(authConfig)

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  // We want to default to 'tr' even if 'en' is preferred, unless 'en' is the only option or similar.
  // Or more simply, if the user explicitly wants / to go to /tr, we can just return i18n.defaultLocale.
  
  try {
    const locale = matchLocale(languages, locales, i18n.defaultLocale)
    return locale
  } catch (e) {
    return i18n.defaultLocale
  }
}

export default auth((req) => {
  const { auth, nextUrl } = req
  const isLoggedIn = !!auth
  const role = auth?.user?.role
  
  const pathname = nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(req)

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        req.url
      )
    )
  }

  const isOnAdmin = pathname.startsWith(`/${nextUrl.pathname.split('/')[1]}/admin`)
  const isOnForum = pathname.startsWith(`/${nextUrl.pathname.split('/')[1]}/forum`)
  
  // 1. Admin Protection
  if (isOnAdmin) {
    if (!isLoggedIn || role !== "admin") {
      const locale = nextUrl.pathname.split('/')[1]
      return Response.redirect(new URL(`/${locale}/login`, nextUrl))
    }
  }

  // 2. Forum Protection has been removed to allow anonymous users to view all content
  // as per the new Auth Control rules.

  return NextResponse.next()
})

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and public asset folders
  matcher: ['/((?!api|_next/static|_next/image|images|uploads|favicon.ico).*)'],
}
