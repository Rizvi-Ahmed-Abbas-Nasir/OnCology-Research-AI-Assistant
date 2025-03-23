import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/db";
import Register from "@/models/register";
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = credentials;
          console.log(`Email: ${email}, Password: ${password}`);

          if (!email || !password) {
            throw new Error("Email and password are required.");
          }

          try {
            await connectMongoDB();
          } catch (dbError) {
            console.error("Database connection failed:", dbError.message);
            throw new Error("Failed to connect to the database. Please try again later.");
          }

          let user;
          try {
            user = await Register.findOne({ StudentEmail: email });
          } catch (dbFindError) {
            console.error("Error finding user:", dbFindError.message);
            throw new Error("Error accessing the user database. Please try again.");
          }

          if (!user) {
            console.log("No user found with this email:", email);
            throw new Error("No user found with this email.");
          }

          let isValidPassword;
          try {
            isValidPassword = await bcrypt.compare(password, user.StudentPassword);
          } catch (bcryptError) {
            console.error("Error comparing passwords:", bcryptError.message);
            throw new Error("Error validating password. Please try again.");
          }

          if (!isValidPassword) {
            console.log("Invalid password attempt for email:", email);
            throw new Error("Invalid password.");
          }

          return {
            id: user._id,
            name: user.StudentName,
            email: user.StudentEmail,
          };
        } catch (error) {
          console.error("Error authorizing user:", error.message);
          throw new Error(error.message || "An error occurred during authentication. Please try again.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Redirect to this page on sign-in failure
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
  },
};

export default authOptions;
