import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 p-6 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            FinTrackDev
          </h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Conta criada com sucesso!
            </CardTitle>
            <CardDescription className="text-base">
              Verifique seu email para confirmar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-1">Próximos passos:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abra seu email</li>
                    <li>Clique no link de confirmação</li>
                    <li>Faça login na sua conta</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Não recebeu o email? Verifique sua caixa de spam
            </div>

            <Button asChild className="w-full h-11">
              <Link href="/auth/login">Ir para login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
