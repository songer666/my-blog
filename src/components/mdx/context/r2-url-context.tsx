'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface R2UrlContextType {
  signedUrls: Record<string, string>;
}

const R2UrlContext = createContext<R2UrlContextType | undefined>(undefined);

export function R2UrlProvider({ 
  children, 
  signedUrls 
}: { 
  children: ReactNode; 
  signedUrls: Record<string, string>;
}) {
  return (
    <R2UrlContext.Provider value={{ signedUrls }}>
      {children}
    </R2UrlContext.Provider>
  );
}

export function useR2Url(r2Key: string): string | null {
  const context = useContext(R2UrlContext);
  
  if (!context) {
    console.warn('useR2Url must be used within R2UrlProvider');
    return null;
  }
  
  return context.signedUrls[r2Key] || null;
}
