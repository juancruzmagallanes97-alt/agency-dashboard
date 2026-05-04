import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"

async function findClientUser(email: string) {
  try {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    if (!url || !key) return null

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key)

    const { data } = await supabase
      .from('users')
      .select('id, email, password_hash, role, cliente_id')
      .eq('email', email)
      .single()

    return data as { id: string; email: string; password_hash: string; role: string; cliente_id: string | null } | null
  } catch {
    return null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email    = credentials.email    as string
        const password = credentials.password as string

        // Admin check (env vars)
        console.log('[auth] email received:', email)
        console.log('[auth] ADMIN_EMAIL env:', process.env.ADMIN_EMAIL)
        console.log('[auth] emails match:', email === process.env.ADMIN_EMAIL)
        if (email === process.env.ADMIN_EMAIL) {
          const raw  = process.env.ADMIN_PASSWORD_HASH ?? ''
          const hash = raw.replace(/^['"]|['"]$/g, '')
          console.log('[auth] hash length:', hash.length)
          console.log('[auth] hash starts with:', hash.substring(0, 7))
          if (!hash) return null
          const valid = await bcryptjs.compare(password, hash)
          console.log('[auth] bcrypt valid:', valid)
          if (!valid) return null
          return { id: 'admin', email, name: 'Sr Smith', role: 'admin' }
        }

        // Client check (Supabase users table)
        const user = await findClientUser(email)
        if (!user) return null

        const valid = await bcryptjs.compare(password, user.password_hash)
        if (!valid) return null

        return {
          id:        user.id,
          email:     user.email,
          name:      user.email,
          role:      user.role as 'admin' | 'client',
          clienteId: user.cliente_id ?? undefined,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role      = (user as any).role      ?? 'client'
        token.clienteId = (user as any).clienteId ?? undefined
      }
      return token
    },
    session({ session, token }) {
      session.user.role      = (token.role as 'admin' | 'client') ?? 'client'
      session.user.clienteId = token.clienteId as string | undefined
      return session
    },
    authorized: async ({ auth }) => !!auth,
  },
})
