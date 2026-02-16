'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface PermissionRequestProps {
  onRequest: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export function PermissionRequest({ onRequest, onDismiss, isLoading }: PermissionRequestProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:max-w-md md:mx-auto">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Rimani aggiornato sulle partite
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ricevi promemoria prima delle partite e aggiornamenti sulle convocazioni.
            </p>
          </div>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <div className="mt-4 flex gap-3">
          <button
            onClick={onRequest}
            disabled={isLoading}
            className="flex-1 h-11 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Attiva notifiche'
            )}
          </button>
          <button
            onClick={onDismiss}
            className="px-4 h-11 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Non ora
          </button>
        </div>
      </div>
    </div>
  );
}
