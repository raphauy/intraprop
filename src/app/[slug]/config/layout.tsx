import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SideBarAdmin from "./side-bar-admin";
import SideBarInmobiliaria from "./side-bar-inmobiliaria";

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return redirect("/login")
  }

  let sidebar= null
  if (currentUser?.role === "admin") {
    sidebar = <SideBarAdmin />
  } else if (currentUser?.role === "inmobiliaria") {
    //sidebar = <SideBarInmobiliaria />
  } else {
    return redirect("/unauthorized?message=No estas autorizado para acceder a esta página")
  }
    


  return (
    <>
      <div className="flex flex-grow w-full">
        {sidebar}
        <div className="flex flex-col items-center flex-grow p-1">{children}</div>
      </div>
    </>
  )
}
