"use client";

import { use, useState, useTransition } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { validateTicket } from "@/app/actions/checkin-actions";
import { CheckCircle2, XCircle, Keyboard, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // Desempacotamos o eventId usando a nova hook 'use' do React (padrão Next.js 15 para Client Components)
  const { eventId } = use(params);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [attendeeInfo, setAttendeeInfo] = useState<{
    name: string;
    tier: string;
  } | null>(null);

  const [manualToken, setManualToken] = useState("");
  const [isPending, startTransition] = useTransition();

  // Função que processa a validação (usada tanto pela câmara como pelo teclado)
  const processCheckIn = (token: string) => {
    // Evita ler o mesmo QR code múltiplas vezes num segundo
    if (isPending || status !== "idle") return;

    startTransition(() => {
      validateTicket(token, eventId).then((res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.message);
          setAttendeeInfo({ name: res.attendeeName!, tier: res.ticketTier! });
        } else {
          setStatus("error");
          setMessage(res.message);
          setAttendeeInfo(null);
        }

        // O ecrã volta à câmara automaticamente após 3 segundos
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
          setAttendeeInfo(null);
        }, 3000);
      });
    });
  };

  // Acionado quando a câmara deteta um QR Code
  const handleScan = (text: string) => {
    if (text) {
      processCheckIn(text);
    }
  };

  // Acionado quando o botão de validação manual é clicado
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      processCheckIn(manualToken.trim());
      setManualToken("");
    }
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6 pt-4">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Scanner de Entrada
        </h1>
        <p className="text-muted-foreground text-sm">
          Aponta a câmara para o bilhete do participante.
        </p>
      </div>

      {/* ÁREA DE FEEDBACK VISUAL (Verde = Sucesso, Vermelho = Erro) */}
      {status === "success" && (
        <Card className="bg-green-500 border-green-600 text-white animate-in zoom-in-95 duration-300">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <CheckCircle2 className="h-20 w-20 mb-4 text-white" />
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
              Autorizado
            </h2>
            <p className="text-lg font-medium">{attendeeInfo?.name}</p>
            <p className="opacity-90">{attendeeInfo?.tier}</p>
          </CardContent>
        </Card>
      )}

      {status === "error" && (
        <Card className="bg-destructive border-destructive text-white animate-in zoom-in-95 duration-300">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
            <XCircle className="h-20 w-20 mb-4 text-white" />
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">
              Recusado
            </h2>
            <p className="font-medium text-lg">{message}</p>
          </CardContent>
        </Card>
      )}

      {/* ÁREA DA CÂMARA (Só aparece quando o estado é 'idle') */}
      <div className={status !== "idle" ? "hidden" : "block"}>
        <div className="overflow-hidden rounded-2xl border-4 border-muted relative bg-black aspect-square flex items-center justify-center">
          {/* O Scanner liga a câmara do telemóvel/computador */}
          <Scanner
            onScan={(result) => handleScan(result[0].rawValue)}
            components={{
              zoom: false,
              finder: true,
            }}
          />
          {isPending && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <span className="text-white font-medium animate-pulse">
                A validar...
              </span>
            </div>
          )}
        </div>

        {/* MODO MANUAL (Caso o telemóvel do participante esteja com o ecrã partido) */}
        <Card className="mt-6 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Validação Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                placeholder="Insira o ID ou Token do bilhete..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                disabled={isPending}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={isPending || !manualToken.trim()}
              >
                Validar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
