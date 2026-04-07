"use client";

import { useState, useTransition, useRef, use } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { validateTicket } from "@/app/actions/checkin-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, QrCode, UserCheck } from "lucide-react";

export default function CheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // O SEGREDO DO NEXT.JS 15: Usamos React.use() para desempacotar a Promise no Client Component
  const { eventId } = use(params);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [isPending, startTransition] = useTransition();

  // Memória para evitar que o scanner leia o mesmo QR Code repetidamente
  const lastScannedToken = useRef<string | null>(null);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  // Função que processa a validação
  const processCheckIn = (token: string) => {
    // Se o sistema estiver ocupado a validar, ou se já estiver a mostrar uma mensagem, ignora
    if (isPending || status !== "idle") return;

    // Bloqueia a leitura do EXATO mesmo token nos próximos 4 segundos (resolve o bug da câmara rápida)
    if (lastScannedToken.current === token) return;

    // Regista na memória e limpa após 4 segundos
    lastScannedToken.current = token;
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(() => {
      lastScannedToken.current = null;
    }, 4000);

    startTransition(() => {
      validateTicket(token, eventId).then((res) => {
        setStatus(res.success ? "success" : "error");
        setMessage(res.message);

        // Oculta a mensagem de sucesso ou erro ao fim de 3 segundos
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
          setManualToken("");
        }, 3000);
      });
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      processCheckIn(manualToken.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check-in</h1>
        <p className="text-muted-foreground">
          Scaneia o QR Code ou digita o código do bilhete.
        </p>
      </div>

      <Card className="overflow-hidden relative">
        {/* Camada de Bloqueio (Quando está a mostrar sucesso ou erro) */}
        {status !== "idle" && (
          <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
            {status === "success" ? (
              <CheckCircle2 className="h-24 w-24 text-green-500 mb-4" />
            ) : (
              <AlertCircle className="h-24 w-24 text-red-500 mb-4" />
            )}
            <h2
              className={`text-2xl font-bold ${status === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {status === "success" ? "Validado!" : "Erro"}
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">{message}</p>
          </div>
        )}

        <div className="aspect-square bg-black relative">
          <Scanner
            onScan={(result) => {
              if (result && result.length > 0) {
                processCheckIn(result[0].rawValue);
              }
            }}
            formats={["qr_code"]}
          />
          {/* Mira visual */}
          <div className="absolute inset-0 border-[3px] border-primary/50 m-12 rounded-xl pointer-events-none" />
        </div>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            Entrada Manual
          </CardTitle>
          <CardDescription>
            O QR Code está ilegível? Digita o ID abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder="Ex: 9D503333..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              disabled={isPending || status !== "idle"}
            />
            <Button
              type="submit"
              disabled={isPending || status !== "idle" || !manualToken}
            >
              Validar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
