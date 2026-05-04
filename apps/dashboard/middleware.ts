import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const session  = req.auth
  const pathname = req.nextUrl.pathname

  if (!session) return NextResponse.next()

  const role      = session.user?.role
  const clienteId = session.user?.clienteId

  if (role === 'client') {
    const portalPath = `/portal/${clienteId}`
    if (!pathname.startsWith('/portal') && pathname !== '/login') {
      return NextResponse.redirect(new URL(portalPath, req.url))
    }
    if (pathname.startsWith('/portal/') && clienteId && !pathname.startsWith(portalPath)) {
      return NextResponse.redirect(new URL(portalPath, req.url))
    }
  }

  if (role === 'admin' && pathname.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
