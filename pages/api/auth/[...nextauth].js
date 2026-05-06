import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabaseAdmin } from '../../../lib/supabase'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const { data: user } = await supabaseAdmin
          .from('medad_users')
          .select('*')
          .eq('email', credentials.email.toLowerCase())
          .single()
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, plan: user.plan, generationsUsed: user.generations_used }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.plan = user.plan; token.generationsUsed = user.generationsUsed }
      return token
    },
    async session({ session, token }) {
      if (token) { session.user.id = token.id; session.user.plan = token.plan; session.user.generationsUsed = token.generationsUsed }
      return session
    },
  },
  pages: { signIn: '/auth' },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
