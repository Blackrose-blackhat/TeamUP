// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { ObjectId } from "mongodb";

// Ensure unique email index
async function ensureIndexes() {
  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection("users");

  // Unique email index
  await usersCollection.createIndex({ email: 1 }, { unique: true });
  console.log("✅ Unique index ensured on users.email");
}

// Ensure indexes on server start
await ensureIndexes();

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise, { databaseName: "teamup" }),
  session: {
    strategy: "jwt", // ✅ use JWT session
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
async signIn({ user, account, profile }) {
  if (!user?.email) return false;

  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");
    const accountsCollection = db.collection("accounts");

    const existingUser = await usersCollection.findOne({ email: user.email });

    if (existingUser) {
      // ✅ Check if account for this provider already exists
      const existingAccount = await accountsCollection.findOne({
        userId: existingUser._id,
        provider: account?.provider,
      });

      if (!existingAccount && account) {
        // ✅ Link new provider to same user
        await accountsCollection.insertOne({
          userId: existingUser._id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
        });
        console.log(`🔗 Linked ${account.provider} to user ${existingUser._id}`);
      }

      // Optional: update GitHub username if missing
      if (account?.provider === "github" && !existingUser.github) {
        await usersCollection.updateOne(
          { _id: existingUser._id },
          { $set: { github: (profile as any)?.login || user.name } }
        );
      }
    } else {
      // New user flow
      const newUser = {
        email: user.email,
        name: user.name,
        image: user.image,
        onboarded: false,
        createdAt: new Date(),
        ...(account?.provider === "github" && {
          github: (profile as any)?.login || user.name,
        }),
      };

      const result = await usersCollection.insertOne(newUser);
      console.log("✅ New user created:", result.insertedId);

      if (account) {
        await accountsCollection.insertOne({
          userId: result.insertedId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
        });
        console.log(`🔗 Linked ${account.provider} to new user ${result.insertedId}`);
      }
    }
  } catch (err) {
    console.error("Error in signIn callback:", err);
  }

  return true;
},

    async jwt({ token, user, account }) {
      // This runs whenever JWT is accessed
      if (user) {
        // First time JWT is created (sign in)
        token.id = (user as any)._id?.toString() || token.id;
      }

      // Always fetch fresh user data to ensure up-to-date onboarded status
      if (token.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const usersCollection = db.collection<User>("users");

          const dbUser = await usersCollection.findOne(
            { email: token.email },
            { projection: { _id: 1, onboarded: 1 } }
          );

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.onboarded = dbUser.onboarded ?? false; // ✅ Default to false if undefined
          }
        } catch (err) {
          console.error("Error fetching user in JWT callback:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.id) {
        // Fallback: if no token.id, treat as new user
        session.user.isNewUser = true;
        return session;
      }

      try {
        const client = await clientPromise;
        const db = client.db();
        const usersCollection = db.collection<User>("users");

        const dbUser = await usersCollection.findOne(
          { _id: new ObjectId(token.id as string) },
          {
            projection: {
              _id: 1,
              email: 1,
              username: 1,
              bio: 1,
              gender: 1,
              year: 1,
              college: 1,
              linkedin: 1,
              github: 1,
              profilePhoto: 1,
              skills: 1,
              projects: 1,
              preferredRoles: 1,
              interests: 1,
              location: 1,
              availability: 1,
              onboarded: 1,
            },
          }
        );

        if (!dbUser) {
          // User not found in database - treat as new user
          session.user.id = token.id as string;
          session.user.isNewUser = true;
          return session;
        }

        // ✅ Properly set isNewUser based on onboarded status
        session.user = {
          ...session.user,
          ...dbUser,
          id: dbUser._id.toString(),
          isNewUser: !dbUser.onboarded, // ✅ If onboarded is false/undefined, user is new
        } as any;

        return session;
      } catch (err) {
        console.error("Error in session callback:", err);
        // Fallback: treat as new user if error occurs
        session.user.id = token.id as string;
        session.user.isNewUser = true;
        return session;
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };