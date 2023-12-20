import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SideBar from "./side-bar";
import { Suspense } from "react";
import { Loader } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return redirect("/login")
  }

  if (currentUser?.role !== "admin") {
    return redirect("/unauthorized?message=You are not authorized to access this page")
  }

  return (
    <>
      <div className="flex flex-grow w-full">
        <Suspense fallback={<Loader className="animate-spin text-green-300" size="2rem" />}>
          <SideBar />
        </Suspense>
        <Suspense fallback={<Loader className="animate-spin w-full mt-10" size="2rem" />}>
          <div className="flex flex-col items-center flex-grow p-1">{children}</div>
        </Suspense>
      </div>
    </>
  )
}
