import { redirect } from 'next/navigation';
import { Header } from '@/components/layouts/Header';
import { Sidebar } from '@/components/layouts/Sidebar';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils'; // Utility to verify token on server
import { UserRole } from '@/lib/types';
import { Metadata } from 'next';
import { AdminLayoutClientWrapper } from '@/components/layouts/AdminLayoutClientWrapper'; // Client Component to provide context

export const metadata: Metadata = {
  title: 'Admin Panel - Micro Freelance Marketplace',
  description: 'Administrator access to manage users, tasks, and system settings.',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side check for admin role
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  let userRole: UserRole | null = null;
  if (accessToken) {
    try {
      const decoded = verifyToken(accessToken, process.env.JWT_SECRET || 'fallback_secret'); // Replace with actual JWT_SECRET
      if (decoded && typeof decoded !== 'string' && decoded.role === UserRole.ADMIN) {
        userRole = UserRole.ADMIN;
      }
    } catch (error) {
      console.error('AdminLayout: Failed to decode JWT for server-side auth:', error);
    }
  }

  if (userRole !== UserRole.ADMIN) {
    // If not admin, redirect to login or a restricted access page
    redirect('/login?message=Admin access required');
  }

  return (
    <AdminLayoutClientWrapper> {/* Client wrapper needed for Zustand, React Query etc. */}
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminLayoutClientWrapper>
  );
}