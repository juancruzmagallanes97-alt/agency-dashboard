import { auth } from "@/auth"

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLogin = req.nextUrl.pathname === '/login'

  if (!isLoggedIn && !isOnLogin) {
    return Response.redirect(new URL('/login', req.nextUrl.origin))
  }
  if (isLoggedIn && isOnLogin) {
    return Response.redirect(new URL('/', req.nextUrl.origin))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
