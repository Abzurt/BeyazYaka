import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'

function getLocale(request: NextRequest): string {
    try {
        const acceptLanguage = request.headers.get('accept-language');
        if (!acceptLanguage) return i18n.defaultLocale;

        const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
        return i18n.locales.includes(preferred as any) ? preferred : i18n.defaultLocale;
    } catch (e) {
        return i18n.defaultLocale;
    }
}

export default function middleware(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;

        // Check if there is any supported locale in the pathname
        const pathnameIsMissingLocale = i18n.locales.every(
            (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
        );

        // Redirect if there is no locale
        if (pathnameIsMissingLocale) {
            const locale = getLocale(request);
            return NextResponse.redirect(
                new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
            );
        }

        return NextResponse.next();
    } catch (error: any) {
        console.error('MIDDLEWARE_RUNTIME_ERROR:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.next();
    }
}

export const config = {
    matcher: ['/((?!api|_next/|static|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)'],
}
