import { Suspense } from "react";
import Main from "@/app/components/page/main/main";

import Fallback from "@/app/components/fallback/fallback"

export default function page() {
  return (
    <>
   
    <Suspense fallback={<Fallback/>}>

      <Main />
    </Suspense>
    </>

  );
}






