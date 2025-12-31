import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret')

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // Paths that require auth
  const protectedPaths = ['/api/ai', '/api/conversations', '/c/', '/settings']
  // If user is accessing protected path
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) || request.nextUrl.pathname === '/'

  // Paths that are for guests only (login/signup)
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      await jwtVerify(session, SECRET)
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isAuthPage && session) {
    try {
      await jwtVerify(session, SECRET)
      return NextResponse.redirect(new URL('/', request.url))
    } catch (e) {
      // Session invalid, allow access to login
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
