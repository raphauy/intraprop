import { Loader } from "lucide-react";

export default function Loading() {
    return (
      <div className="w-full mt-10">
        <Loader className="animate-spin" size="2rem" />
      </div>
    )
  }