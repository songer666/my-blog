import { BioCard } from "@/components/admin/profile/bio/bio-card";
import { LinkCard } from "@/components/admin/profile/link/link-card";
import { EducateCard } from "@/components/admin/profile/educate/educate-card";
import { SkillCard } from "@/components/admin/profile/skill/skill-card";
import { FriendCard } from "@/components/admin/profile/friend/friend-card";
import { caller } from "@/components/trpc/server";
import { serializeMdx } from "@/components/mdx/utils";
import styles from "./profile-main.module.css";
import {auth} from "@/lib/auth";

export async function ProfileMain() {
    // 服务端获取个人资料数据
    const profileData = await caller.bio.get();
    const socialLinkData = await caller.link.list();
    const educationData = await caller.educate.list();
    const skillData = await caller.skill.list();
    const friendData = await caller.friend.list();
    auth.api.forgetPassword
    
    // 序列化个人简介的 MDX 内容
    const serializedBio = profileData?.data?.bio 
        ? await serializeMdx(profileData.data.bio)
        : null;

    return (
        <div className={styles.container}>
            <BioCard 
                initialData={profileData?.data || null} 
                serializedBio={serializedBio}
            />
            <LinkCard initialData={socialLinkData?.data || []} />
            <EducateCard initialData={educationData?.data || []} />
            <SkillCard initialData={skillData?.data || []} />
            <FriendCard initialData={friendData?.data || []} />
        </div>
    );
}
