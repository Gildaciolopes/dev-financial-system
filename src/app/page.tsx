import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            FinTracker
          </h1>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Controle suas finanças de forma{" "}
              <span className="text-primary">inteligente</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Gerencie suas despesas, receitas e metas financeiras com
              visualizações interativas e análises detalhadas. Tudo em um só
              lugar.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/auth/register">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-transparent"
              >
                <Link href="/auth/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Gráficos Interativos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualize seus gastos e receitas com gráficos detalhados e
                fáceis de entender
              </p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Controle de Orçamento
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Defina orçamentos por categoria e acompanhe seus gastos em tempo
                real
              </p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Metas Financeiras
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Crie e acompanhe suas metas de economia com progresso visual
              </p>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Relatórios Detalhados
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Análises completas dos seus padrões de consumo e tendências
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 Fresh FinTracker. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
