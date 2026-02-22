"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { SettingsForm } from "./settings-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPageClient() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'it';
  
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      // Get user data from localStorage
      const storedUser = localStorage.getItem("user-data");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setEmail(userData.email || "");
        } catch {
          setEmail("");
        }
      }
      setLoading(false);
    }
  }, [sessionLoading, session, router]);

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </Link>
      </div>
      <SettingsForm email={email} />
    </div>
  );
}
