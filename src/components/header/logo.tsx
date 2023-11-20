"use client";

import { fontNunito, fontRubik, fontSans  } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";


export default function Logo() {

  return (
    <Link href="/">
      <div className="flex flex-col items-center">
        <Image src="/logo-intraprop.svg" width={180} height={50} alt="Osom logo" />        
      </div>
    </Link>
  )
}
