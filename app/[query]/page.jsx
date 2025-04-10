

import { Suspense } from "react";
import Main from "../components/page/main/main";

export default function Home() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
      <Main />
    </Suspense>
  );
}

