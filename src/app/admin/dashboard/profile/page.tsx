
import { Suspense } from "react";
import { ProfileMain } from "@/components/admin/profile/profile-main";
import { ProfileSkeleton } from "@/components/skeleton/admin-skeleton";

export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfileSkeleton />}>
            <ProfileMain />
        </Suspense>
    );
}