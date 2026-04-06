import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail } from "lucide-react";

export default async function AccountSettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="max-w-3xl w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground">
          Faça a gestão do seu perfil de organizador.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais</CardTitle>
          <CardDescription>
            Informações básicas associadas à sua conta na Zev3nt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <Input
                id="name"
                defaultValue={user?.name || ""}
                className="pl-10"
                readOnly
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail de Acesso</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                className="pl-1000"
                readOnly
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 border-t">
          <p className="text-sm text-muted-foreground">
            A edição do perfil de organizador será disponibilizada numa futura
            atualização. Para alterar o seu e-mail, entre em contacto com o
            suporte.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
