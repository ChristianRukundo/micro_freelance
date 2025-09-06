// frontend/app/freelancers/[id]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { User } from "@/lib/types";
import { getApiWithAuth } from "@/lib/api-server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MailIcon,
  StarIcon,
  BriefcaseIcon,
  ExternalLinkIcon,
  MapPinIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

type Props = {
  params: Promise<{ id: string }>;
};

// Server Component function to fetch the freelancer's public profile
async function getFreelancerProfile(id: string): Promise<User | null> {
  try {
    const api = await getApiWithAuth(); // Use server-side api helper
    const response = await api.get(`/freelancers/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Handle not found gracefully
    }
    console.error(`Failed to fetch freelancer ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const freelancer = await getFreelancerProfile(id);
  if (!freelancer || !freelancer.profile) {
    return { title: "Freelancer Not Found" };
  }
  const { firstName, lastName, bio } = freelancer.profile;
  const name = `${firstName} ${lastName}`;
  return {
    title: `${name} | Freelancer Profile`,
    description:
      bio?.substring(0, 160) ||
      `Public profile for ${name}, a skilled freelancer.`,
  };
}

export default async function FreelancerProfilePage({ params }: Props) {
  const { id } = await params;
  const freelancer = await getFreelancerProfile(id);

  if (!freelancer || !freelancer.profile) {
    notFound();
  }

  const { profile } = freelancer;
  const name = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="container py-8 md:py-12">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Main Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg dark:shadow-black/20">
            <CardHeader className="flex flex-col md:flex-row items-start gap-6 p-6 md:p-8">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-primary/20 shadow-lg">
                <AvatarImage
                  src={
                    profile.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
                  }
                  alt={name}
                />
                <AvatarFallback className="text-5xl">
                  {profile.firstName.charAt(0)}
                  {profile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-display-sm font-extrabold">{name}</h1>
                <p className="text-body-lg text-muted-foreground mt-1">
                  {freelancer.email}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-body-sm">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />{" "}
                    San Francisco, CA
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-2 text-yellow-500" /> 4.9
                    (23 Reviews)
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-muted-foreground" />{" "}
                    58 Projects Completed
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button size="lg" className="shadow-primary">
                    <MailIcon className="mr-2 h-5 w-5" /> Contact Me
                  </Button>
                  <Button size="lg" variant="outline">
                    View All Projects
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* About Me Section */}
          <Card className="shadow-lg dark:shadow-black/20">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {profile.bio || "This freelancer hasn't written a bio yet."}
                </ReactMarkdown>
              </article>
            </CardContent>
          </Card>

          {/* Portfolio Gallery Placeholder */}
          <Card className="shadow-lg dark:shadow-black/20">
            <CardHeader>
              <CardTitle>Portfolio Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Placeholder items */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  Portfolio Item 1
                </div>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  Portfolio Item 2
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Skills & Links */}
        <div className="space-y-8 lg:sticky lg:top-24">
          <Card className="shadow-lg dark:shadow-black/20">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-body-sm text-muted-foreground">
                    No skills listed.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:shadow-black/20">
            <CardHeader>
              <CardTitle>Portfolio & Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.portfolioLinks.length > 0 ? (
                  profile.portfolioLinks.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted group"
                    >
                      <span className="text-primary hover:underline truncate">
                        {link.replace("https://", "").replace("www.", "")}
                      </span>
                      <ExternalLinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))
                ) : (
                  <p className="text-body-sm text-muted-foreground">
                    No links provided.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
