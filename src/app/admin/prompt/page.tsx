import { getValue } from "@/services/config-services"
import { PromptForm } from "./prompt-form"

export default async function PromptPage() {
    const prompt= await getValue("PROMPT") || "PROMPT NO CONFIGURADO"

    return (
        <div className="container mt-10 space-y-5">
            <p className="mb-4 text-3xl font-bold text-center">Prompt</p>
            <div 
                className="w-full p-4 border rounded-lg">
                <PromptForm prompt={prompt} />
            </div>
            
        </div>
    )
}
