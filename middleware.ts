import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hardcoded for safe Edge bundling
const locales = ['tr', 'en']
const defaultLocale = 'tr'

export default function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl

        // Check if there is any supported locale in the pathname
        const pathnameIsMissingLocale = locales.every(
            (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
        )

        // Redirect if there is no locale
        if (pathnameIsMissingLocale) {
            const acceptLanguage = request.headers.get('accept-language')
            let locale = defaultLocale
            if (acceptLanguage) {
                const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
                if (locales.includes(preferred as any)) {
                    locale = preferred
                }
            }

            const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
            return NextResponse.redirect(url)
        }

        return NextResponse.next()
    } catch (err) {
        console.error('Middleware runtime error:', err)
        return NextResponse.next()
    }
}

export const config = {
    matcher: ['/((?!api|_next/|static|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)'],
}
