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
  async jwt({ token, user, account }) {
    if (user) {
      token.id = (user as any)._id?.toString() || token.id;
      token.onboarded = (user as any).onboarded ?? false;

      // If first sign-in via GitHub, store GitHub username in DB
      if (account?.provider === "github" && user?.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const usersCollection = db.collection<User>("users");

          // Update github field if not already set
          await usersCollection.updateOne(
            { email: user.email },
            { $set: { github: (user as any).name || (user as any).login } }, // map name/login to github
            { upsert: true }
          );
        } catch (err) {
          console.error("Error updating GitHub username:", err);
        }
      }
    }
    return token;
  },

  async session({ session, token }) {
    if (!token.id) return session;

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
      session.user.id = token.id as string;
      session.user.isNewUser = true;
      return session;
    }

    session.user = {
      ...session.user,
      ...dbUser,
      id: dbUser._id.toString(),
      isNewUser: !dbUser.onboarded,
    } as any;

    return session;
  },
},

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
