import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, GraduationCap, Plus, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/stat-card";
import { authApi } from "@/lib/api/endpoints";
import { auth, ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — UniPlus" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@universite.dz");
  const [password, setPassword] = useState("demo1234");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res?.accessToken) auth.setToken(res.accessToken);
      if (res?.user) auth.setUser(res.user);
      toast.success("Connexion réussie");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof ApiError
        ? `Échec de connexion (${err.status}) — ${err.message}`
        : "API injoignable. Connexion en mode démo.";
      toast.error(msg);
      auth.setToken("demo-token");
      auth.setUser({ email, nom: "Admin", prenom: "Démo" });
      setTimeout(() => navigate({ to: "/dashboard" }), 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      <div className="hidden relative lg:flex flex-col justify-between bg-sidebar p-12 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,91,227,0.25),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="relative flex justify-center items-center bg-primary shadow-lg shadow-primary/30 rounded-xl w-12 h-12">
              <GraduationCap className="w-6 h-6" />
              <div className="-top-1 -right-1 absolute flex justify-center items-center bg-white rounded-full ring-2 ring-primary w-5 h-5 text-primary">
                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
            </div>
            <span className="font-bold text-2xl">Uni<span className="text-primary">Plus</span></span>
          </div>
        </div>
        <div className="relative">
          <h2 className="max-w-md font-bold text-4xl leading-tight">
            La plateforme intelligente pour la gestion universitaire LMD.
          </h2>
          <p className="mt-4 max-w-md text-white/60 text-sm">
            Gérez votre université avec intelligence. Une expérience pensée pour les administrateurs académiques.
          </p>
          <ul className="space-y-3 mt-8">
            {["Gestion complète des étudiants", "Calcul automatique des résultats", "Bulletins en un clic"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="flex justify-center items-center bg-primary/20 rounded-full w-5 h-5 text-primary">
                  <Check className="w-3 h-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-white/40 text-xs">UniPlus v1.0 — Système LMD</div>
      </div>

      <div className="flex justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <h1 className="font-bold text-3xl">Connexion à UniPlus</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Saisissez vos identifiants pour accéder à votre portail.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div>
              {/* ✅ htmlFor + id */}
              <label htmlFor="login-email" className="font-medium text-muted-foreground text-xs">Email</label>
              <div className="relative mt-1.5">
                <Mail className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background pr-3 pl-10 border border-border focus:border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/15 w-full h-11 text-sm"
                />
              </div>
            </div>
            <div>
              {/* ✅ htmlFor + id */}
              <label htmlFor="login-password" className="font-medium text-muted-foreground text-xs">Mot de passe</label>
              <div className="relative mt-1.5">
                <Lock className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pr-10 pl-10 border border-border focus:border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/15 w-full h-11 text-sm"
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPwd((v) => !v)}
                  className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground -translate-y-1/2"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-muted-foreground text-sm">
              <input type="checkbox" className="border-border rounded w-4 h-4 accent-primary" />
              Se souvenir de moi
            </label>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          <div className="mt-8 text-muted-foreground text-xs text-center">UniPlus v1.0 — Système LMD</div>
        </div>
      </div>
    </div>
  );
}