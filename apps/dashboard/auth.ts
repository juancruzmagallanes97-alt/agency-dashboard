import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string
        const password = credentials.password as string

        if (email !== process.env.ADMIN_EMAIL) return null

        const hash = process.env.ADMIN_PASSWORD_HASH
        if (!hash) return null

        const valid = await bcryptjs.compare(password, hash)
        if (!valid) return null

        return { id: '1', email, name: 'Admin' }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    authorized: async ({ auth }) => !!auth,
  },
})
