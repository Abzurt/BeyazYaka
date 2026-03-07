import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('x-middleware-trace', 'true')
  return response
}

export const config = {
  matcher: ['/((?!api|_next/|static|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)'],
}
