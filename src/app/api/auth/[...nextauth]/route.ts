import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkRateLimit, createRateLimitHeaders } from "@/lib/rate-limit";
import { logActivity, extractIp } from "@/lib/activity-log";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const username = credentials?.username?.trim() || 'unknown';
        
        if (!credentials?.username || !credentials?.password) {
          await logActivity({
            adminId: username,
            action: 'LOGIN_FAILED',
            entityType: 'auth',
            details: { reason: 'missing_credentials', username },
            ip: extractIp(req as Request | undefined),
          }).catch(err => console.log('[AUTH DEBUG] logActivity error:', err));
          throw new Error("Invalid credentials");
        }

        const ip = extractIp(req as Request | undefined);
        try {
          const rateLimit = await checkRateLimit(`login:${username}`, 5, 15 * 60 * 1000);
          if (!rateLimit.allowed) {
            console.log('[AUTH DEBUG] Rate limit exceeded');
            await logActivity({
              adminId: username,
              action: 'LOGIN_FAILED',
              entityType: 'auth',
              details: { reason: 'rate_limited', username },
              ip,
            }).catch(() => {});
            throw new Error("Too many login attempts. Please try again later.");
          }
        } catch (error) {
          console.error('[AUTH DEBUG] checkRateLimit Error:', error);
          // Don't fail the login if rate limit check fails (db down etc)
        }

        const adminUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_UserName;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminUsername || !adminPassword) {
          throw new Error("Admin credentials not configured");
        }

        if (
          username === adminUsername &&
          credentials.password === adminPassword
        ) {
          try {
            await logActivity({
              adminId: username,
              action: 'LOGIN',
              entityType: 'auth',
              details: { status: 'success' },
              ip,
            });
          } catch (err) {
            console.error('[AUTH DEBUG] logActivity (success) Error:', err);
          }

          return {
            id: "admin-1",
            email: "admin@portfolio.com",
            name: "Mariam",
            role: "admin",
          };
        }

        await logActivity({
          adminId: username,
          action: 'LOGIN_FAILED',
          entityType: 'auth',
          details: { reason: 'invalid_credentials', username },
          ip,
        });

        throw new Error("Invalid credentials");
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Log successful login on first JWT creation
        await logActivity({
          adminId: user.id,
          action: 'LOGIN_SUCCESS',
          entityType: 'auth',
          details: { name: user.name, email: user.email },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
