// app/dashboard/gigs/page.tsx
import { fetchGigs } from "@/actions/gig/fetch-gigs";
import { GigListClient } from "@/components/gigs/gig-listing";


interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}



export default async function GigListPage(props: Props) {
  const searchParams = await props.searchParams;
  const data = await fetchGigs(searchParams);

  return (
    <GigListClient
      gigs={data.gigs}
      pagination={data.pagination}
      searchParams={searchParams}
      error={data.error}
    />
  );
}