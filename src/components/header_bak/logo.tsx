"use client";

import { fontNunito, fontRubik, fontSans  } from "@/lib/fonts"
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";


export default function Logo() {

  return (
    <Link href="/">
      <div className="flex flex-col items-center">
        <p className="text-4xl font-bold tracking-wider">Logo</p>
        <p className="-mt-2 text-2xl font-medium text-first-color">Sublogo</p>
      </div>
    </Link>
  )
}
