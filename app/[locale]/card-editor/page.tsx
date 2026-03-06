'use client';

import { CardTemplateEditor } from '@/components/card-template-editor';
import { useEffect, useState } from 'react';

export default function CardEditorPage() {
  const [isDev, setIsDev] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple dev check - only allow in development mode
    // In production, this page should not be accessible
    const devMode = process.env.NODE_ENV === 'development' || 
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';
    setIsDev(devMode);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This tool is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Card Template Editor</h1>
          <p className="text-sm text-muted-foreground">
            Developer tool - Drag and resize regions to define card layout
          </p>
        </div>
      </header>
      
      <main className="container mx-auto py-6">
        <CardTemplateEditor />
      </main>
    </div>
  );
}