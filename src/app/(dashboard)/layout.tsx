import { TabBar } from "@/components/dashboard/TabBar";
import { TopNav } from "@/components/dashboard/TopNav";
import { LivingBackground } from "@/components/dashboard/LivingBackground";
import { UserProvider } from "@/components/providers/UserProvider";
import { ProfileGate } from "@/components/dashboard/ProfileGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LivingBackground />
      <TopNav />
      <main className="main-content">
        <TabBar />
        {children}
      </main>
      <ProfileGate />
    </UserProvider>
  );
}
