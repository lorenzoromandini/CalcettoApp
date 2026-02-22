"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { authFetch } from "@/lib/auth-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPageClient() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'it';
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
    } else {
      setLoading(false);
    }
  }, [sessionLoading, session, router]);

  const handlePasswordChange = async () => {
    setError("");
    setSaveSuccess(false);
    
    if (newPassword !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    if (newPassword.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    setIsSaving(true);
    try {
      const res = await authFetch("/api/user/password", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Errore durante il cambio password");
        return;
      }

      setSaveSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Errore durante il cambio password");
    } finally {
      setIsSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Indietro</span>
          </Link>
        </div>
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
          <span>Indietro</span>
        </Link>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          Impostazioni
        </h1>

        <div className="max-w-md space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cambia Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Password Attuale</Label>
                <Input
                  id="current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">Nuova Password</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Conferma Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {saveSuccess && (
                <p className="text-sm text-green-600">Password cambiata con successo!</p>
              )}

              <Button
                onClick={handlePasswordChange}
                disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cambia Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
