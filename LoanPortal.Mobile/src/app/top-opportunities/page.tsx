import { Suspense } from "react";
import TopOpportunitiesClient from "./TopOpportunitiesClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TopOpportunitiesClient />
    </Suspense>
  );
}
