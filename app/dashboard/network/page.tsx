// app/users/page.tsx
import UsersList from "@/components/user/users-list"
import { headers } from "next/headers"

export default async function UsersPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || "1", 10)
  const perPage = 6

  const headersList = await headers()
  const res = await fetch(
  `/api/user/all?page=${page}&perPage=${perPage}`,
  {
    cache: "no-store",
    headers: {
      Cookie: headersList.get("cookie") || "",
    },
  }
)

  console.log(res);
  if (!res.ok) {
    throw new Error("Failed to fetch users")
  }

  const { users, totalPages } = await res.json()

  return <UsersList users={users} page={page} totalPages={totalPages} />
}
