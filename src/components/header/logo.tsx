"use client";

import Image from "next/image";
import Link from "next/link";


export default function Logo() {

  return (
    <Link href="/">
      <div className="flex flex-col items-center py-1">
        <Image src="/logo-intraprop.svg" width={180} height={50} alt="Osom logo"/>        
      </div>
    </Link>
  )
}
