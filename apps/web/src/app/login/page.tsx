'use client';

import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <AuthModal isOpen={true} onClose={() => router.push('/')} defaultRole="customer" />
    </div>
  );
}
