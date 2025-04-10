import { Suspense } from "react";
import Main from "./components/page/main/main";

export default function Home() {
  return (
    <Suspense fallback={<div ></div>}>
      <Main />
    </Suspense>
  );
}
