"use client";

import { useSession } from "@/components/providers/session-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setChecked(true);
      if (!session?.user?.id) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoading, session, router, pathname]);

  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return <>{children}</>;
}
