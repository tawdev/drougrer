import { notFound } from 'next/navigation';
import PortalClient from './PortalClient';

interface PortalPageProps {
  params: Promise<{
    key: string;
  }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const resolvedParams = await params;
  
  // The secret magic key required in the URL
  const SECRET_KEY = process.env.NEXT_PUBLIC_PORTAL_KEY || 'secure-access-2026-c-digital';
  
  if (!SECRET_KEY || resolvedParams.key !== SECRET_KEY) {
    // If the key is wrong, return a 404 to hide the route's existence
    notFound();
  }

  return <PortalClient />;
}
