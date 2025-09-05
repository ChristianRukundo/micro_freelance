"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { MailIcon, StarIcon, BriefcaseIcon, MoveRightIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FreelancerCardProps {
  freelancer: User;
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const avatarSeed =
    freelancer.profile?.firstName || freelancer.email || "Freelancer";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark transition-all duration-300 ease-in-out-quad hover:shadow-medium dark:shadow-medium-dark hover:border-primary-200">
        <Link
          href={`/freelancers/${freelancer.id}`}
          className="absolute inset-0 z-10"
          aria-label={`View freelancer ${freelancer.profile?.firstName}`}
        ></Link>
        <CardHeader className="flex flex-col items-center p-6 pb-4">
          <Avatar className="h-20 w-20 border-2 border-primary-500 shadow-soft dark:shadow-soft-dark">
            <AvatarImage
              src={
                freelancer.profile?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`
              }
              alt={avatarSeed}
            />
            <AvatarFallback className="text-h3 font-semibold">
              {avatarSeed.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-h4 font-bold transition-colors group-hover:text-primary-600">
            {freelancer.profile?.firstName} {freelancer.profile?.lastName}
          </CardTitle>
          <CardDescription className="text-body-md mt-1">
            {freelancer.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          {freelancer.profile?.skills &&
            freelancer.profile.skills.length > 0 && (
              <div>
                <h4 className="text-h6 font-semibold mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {freelancer.profile.skills.slice(0, 4).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-body-sm font-medium bg-primary-50 text-primary-600"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.profile.skills.length > 4 && (
                    <Badge variant="outline" className="text-body-sm">
                      +{freelancer.profile.skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

          {freelancer.profile?.bio && (
            <CardDescription className="text-body-sm line-clamp-3">
              {freelancer.profile.bio}
            </CardDescription>
          )}

          <div className="flex items-center text-body-sm">
            <StarIcon className="mr-2 h-4 w-4 text-yellow-500" />
            <span>4.8 (12 Reviews)</span> {/* Placeholder for rating */}
            <BriefcaseIcon className="ml-4 mr-2 h-4 w-4 text-primary-500" />
            <span>15 Projects Completed</span>{" "}
            {/* Placeholder for project count */}
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0 relative z-20">
          <Button
            variant="outline"
            className="w-full group shadow-soft dark:shadow-soft-dark hover:shadow-medium dark:shadow-medium-dark"
          >
            View Profile{" "}
            <MoveRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
