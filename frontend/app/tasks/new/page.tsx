import { Metadata } from "next";
import { TaskForms } from "@/components/forms/TaskForms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Post New Task - Micro Freelance Marketplace",
  description: "Create a new project task for freelancers to bid on.",
};

export default function NewTaskPage() {
  return (
    <div className="container py-8">
      <Card className="w-full shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">
            Post a New Project
          </CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Describe your project in detail, set your budget, and attach any
            relevant files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6 bg-neutral-200" />
          <TaskForms formType="new" />
        </CardContent>
      </Card>
    </div>
  );
}
