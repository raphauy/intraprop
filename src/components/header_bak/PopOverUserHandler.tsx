"use client"

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";


export default function PopOverUserHandler() {
  const { data:session }= useSession()

  const user= session?.user

  if (!user)
      return <div></div>

  function onLogout(){
    signOut({ callbackUrl: '/login' })    
  }
      
  return (
    <>
      <nav className="flex flex-col gap-2 mt-1 text-sm text-gray-600 min-w-[230px]">
        <ul>
          <li className="flex items-center gap-2 p-1 mb-5 ml-1 border-b">            
            <User /> {user.email} 
          </li>
          <li className="flex items-center w-full mt-16 border-t rounded-md">
            <div onClick={onLogout} 
              className="flex items-center flex-grow px-1 py-3 mt-2 rounded-md cursor-pointer hover:border hover:border-gray-500 hover:bg-gray-200">
              <LogOut className="mr-2" />Logout
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
}

