import { auth } from "@/auth"

export const proxy = auth((req) => {
  const session  = req.auth
  const pathname = req.nextUrl.pathname
  const isOnLogin = pathname === '/login'

  if (!session && !isOnLogin) {
    return Response.redirect(new URL('/login', req.nextUrl.origin))
  }
  if (session && isOnLogin) {
    const role      = session.user?.role
    const clienteId = session.user?.clienteId
    if (role === 'client' && clienteId) {
      return Response.redirect(new URL(`/portal/${clienteId}`, req.nextUrl.origin))
    }
    return Response.redirect(new URL('/', req.nextUrl.origin))
  }

  if (session) {
    const role      = session.user?.role
    const clienteId = session.user?.clienteId

    if (role === 'client' && clienteId) {
      const portalPath = `/portal/${clienteId}`
      if (!pathname.startsWith('/portal') && !isOnLogin) {
        return Response.redirect(new URL(portalPath, req.nextUrl.origin))
      }
      if (pathname.startsWith('/portal/') && !pathname.startsWith(portalPath)) {
        return Response.redirect(new URL(portalPath, req.nextUrl.origin))
      }
    }

    if (role === 'admin' && pathname.startsWith('/portal')) {
      return Response.redirect(new URL('/', req.nextUrl.origin))
    }
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
