'use client';

import React from 'react';
import { AuthProvider } from './AuthProvider'; // Use the root AuthProvider

export function AdminLayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}