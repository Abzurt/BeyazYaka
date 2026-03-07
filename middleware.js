export default function middleware(req) {
    // Absolute minimal middleware with no imports
    return new Response(null, {
        headers: { 'x-middleware-debug': 'minimal-js' }
    })
}

export const config = {
    matcher: ['/((?!api|_next/|static|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)'],
}
