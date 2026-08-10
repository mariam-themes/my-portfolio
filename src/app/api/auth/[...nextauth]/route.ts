import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("=== NEXTAUTH LOGIN ATTEMPT ===");
        console.log("Credentials received:", credentials);
        
        if (!credentials?.username || !credentials?.password) {
          console.log("Error: Missing username or password");
          throw new Error("Invalid credentials");
        }

        // Use fixed admin credentials from environment variables (fallback for local dev)
        const adminUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_UserName || "Mariam";
        const adminPassword = process.env.ADMIN_PASSWORD || "Mariam@88";

        console.log("Expected Username:", adminUsername);
        console.log("Expected Password:", adminPassword);

        if (
          credentials.username.trim().toLowerCase() === adminUsername.toLowerCase() &&
          credentials.password.trim() === adminPassword
        ) {
          return {
            id: "admin-1",
            email: "admin@portfolio.com", // Dummy email to satisfy NextAuth user object
            name: "Mariam",
            role: "admin",
          };
        }
        
        throw new Error("Invalid credentials");
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
