import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NavigationHeader from "@/components/NavigationHeader";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ExecutionsList from "@/components/profile/ExecutionsList";
import StarredSnippetsList from "@/components/profile/StarredSnippetsList";
import UserSnippetsList from "@/components/profile/UserSnippetsList";
import {
  getUserData,
  getUserStats,
  getUserExecutions,
  getStarredSnippets,
  getUserSnippets,
} from "@/lib/actions";

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch all data in parallel
  const [userData, userStats, executions, starredSnippets, userSnippets] =
    await Promise.all([
      getUserData(),
      getUserStats(user.id),
      getUserExecutions(user.id, 10, 0),
      getStarredSnippets(user.id),
      getUserSnippets(user.id),
    ]);

  if (!userData) {
    // If user data doesn't exist in our database, you might want to create it here
    // For now, we'll redirect to sign-in
    redirect("/sign-in");
  }

  const starredSnippetsCount = starredSnippets.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <ProfileHeader
          userStats={userStats}
          userData={userData}
          user={user}
          starredSnippetsCount={starredSnippetsCount}
        />

        {/* Main content with tabs */}
        <ProfileTabs
          snippetsContent={<UserSnippetsList userSnippets={userSnippets} />}
          executionsContent={<ExecutionsList executions={executions} />}
          starredContent={
            <StarredSnippetsList starredSnippets={starredSnippets} />
          }
        />
      </div>
    </div>
  );
}
