"use client";

import { useUser } from "@/components/providers/UserProvider";
import { CompleteProfileModal } from "@/components/modals/CompleteProfileModal";

export function ProfileGate() {
  const { user, loading } = useUser();
  if (loading || !user) return null;
  if (user.completedRegistration) return null;
  return <CompleteProfileModal />;
}
