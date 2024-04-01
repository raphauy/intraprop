"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { getShareDataAction, setSharedByAction } from "./actions";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props= {
  coincidenceId: string
  showSwitch: boolean
}


export function ShareDialog({ coincidenceId, showSwitch }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const [changeDestination, setChangeDestination] = useState(false)
  const [destination, setDestination] = useState("")
  const [pedidoPhone, setPedidoPhone] = useState("")

  const session= useSession()
  const user= session.data?.user
  
  useEffect(() => {
    if (!open) return

    setLoading(true)
    getShareDataAction(coincidenceId)
    .then((res) => {
      if (!res) return setText("Error al cargar los datos")
      if (!user?.phone) return setText("No se puede compartir la propiedad porque no tenés un número de teléfono asociado a tu cuenta de Intraprop")
      setDestination(res.pedidoPhone)
      setPedidoPhone(res.pedidoPhone)

      const text= `
Hola Servicios Inmobiliarios, te escribe ${user?.name} de *${res.inmoName}* por el pedido que hiciste en el grupo ${res.groupName}. 

Tenemos esta propiedad que creemos que te puede interesar. 

Para contactarme, escribime o llamame a: ${user?.phone}.

${res.url}
`
      setText(text)
    })
    .catch((err) => {
      console.error(err)
      setText("Error al cargar los datos")
    })
    .finally(() => {
      setLoading(false)
    })
  }, [open, coincidenceId, user?.name, user?.phone, user?.email])

  function sendWap() {    
    setLoading(true)
    setSharedByAction(coincidenceId, user?.name || "", destination, text)
    .then(() => {
      toast({ title: "Propiedad compartida por WhatsApp" })
    })
    .catch((err) => {
      console.error(err)
      toast({ title: "Error al compartir por WhatsApp", variant: "destructive" })
    })
    .finally(() => {
      setLoading(false)
      setOpen(false)
    })
  }

  function toggleSwitch() {
    if (changeDestination) {
      setDestination(pedidoPhone)
      setChangeDestination(false)
    } else {
      setDestination(user?.phone || "")
      setChangeDestination(true)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MessageCircle className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="">Compartir propiedad</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          {
            loading ? <Loader className="animate-spin" /> : text ? (
              <div className="space-y-5">
                <p className="whitespace-pre-wrap mb-3 text-muted-foreground">{processText(text)}</p>
                <Separator />
                <div className="flex justify-between">
                  <p>Destinatario: {destination}</p>
                  {
                    showSwitch &&
                    <div className={cn("flex items-center gap-2")}>
                      <p>Enviar a mi número</p>
                      <Switch checked={changeDestination} onCheckedChange={toggleSwitch} />
                    </div>
                  }
                </div>

                <Button className="mt-4 w-full" 
                  autoFocus={false} 
                  onClick={sendWap}
                  disabled={!user?.phone}
                >
                  Enviar por WhatsApp
                </Button>
              </div>
            ) : "Error al cargar los datos"
          }
        </div>
        
      </DialogContent>
    </Dialog>
  )
}

function putBold(text: string) {

  const parts = text.split(/(\*[^*]+\*)/g);

  return parts.map((part, index) => {
    // Si la parte está entre asteriscos, quita los asteriscos y aplica el estilo en negrita.
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <span key={index} className="font-bold">
          {part.substring(1, part.length - 1)}
        </span>
      );
    } else {
      // Si no está entre asteriscos, renderiza la parte tal cual.
      return part;
    }
  });
  
}


function processText(text: string) {
  // Esta expresión regular busca URLs de forma más precisa y evita capturar texto repetido como "http"
  const urlRegex = /(\bhttps?:\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/gi;

  // Primero, separamos el texto en bloques basándonos en la presencia de URLs
  const parts = text.split(urlRegex);

  return parts.flatMap((part, index) => {
    // Si la parte cumple con la expresión regular de URL, se renderiza como un enlace
    if (part.match(urlRegex)) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
          {part}
        </a>
      );
    } else {
      // Para texto que no es URL, busca y procesa para negrita
      return part.split(/(\*[^*]+\*)/g).map((subPart, subIndex) => {
        if (subPart.startsWith("*") && subPart.endsWith("*")) {
          // Si la subparte está entre asteriscos, se aplica negrita
          return <span key={`${index}-${subIndex}`} className="font-bold">{subPart.substring(1, subPart.length - 1)}</span>;
        } else {
          // Si no, se devuelve la subparte tal cual
          return subPart;
        }
      });
    }
  });
}
