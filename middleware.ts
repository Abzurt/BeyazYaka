import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  try {
    console.log('Middleware invoked for:', request.nextUrl.pathname);
    const response = NextResponse.next();
    response.headers.set('x-middleware-trace', 'true');
    return response;
  } catch (error: any) {
    console.error('MIDDLEWARE_ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Return a response even on error to see if we can avoid the hard 500
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/|static|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)'],
}
