import { NextAuthConfig } from 'next-auth';

export default {
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
    verifyRequest: '/forgot',
  },
  debug: true,
  providers: [],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      const sessionClone = { ...session };
      sessionClone.userId = (token.userId as string).toString(); // Add userId to session
      console.log('session', sessionClone);

      return sessionClone;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id; // Add userId to JWT token
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET, // Add this line
} as NextAuthConfig;
