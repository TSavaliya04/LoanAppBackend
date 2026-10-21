'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/SessionStore';
import { Box, CircularProgress } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const { user, hasHydrated } = useSessionStore();

  useEffect(() => {
    if (hasHydrated) {
      if (user?.isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [hasHydrated, user, router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
