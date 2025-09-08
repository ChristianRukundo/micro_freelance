import { Suspense } from "react";
import { TaskDetailsSkeleton } from "@/components/common/SkeletonLoaders";
import { TaskDetailsPageClient } from "@/components/tasks/TaskDetailsClient";

type Props = {
  params: Promise<{ id: string }>;
};

// This is a Server Component. It does no data fetching.
// It only extracts the ID and passes it to the Client Component.
export default async function TaskDetailsPage({ params }: Props) {
  const { id } = await params;

  return (
    // Suspense is important here to show a fallback while the client component and its hooks load.
    <Suspense fallback={<TaskDetailsSkeleton />}>
      <TaskDetailsPageClient taskId={id} isWorkspace={false} />
    </Suspense>
  );
}