import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2Icon,
  BriefcaseIcon,
  MessageCircleIcon,
  PiggyBankIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  UsersIcon,
  AwardIcon,
  HammerIcon,
  ListChecksIcon,
  DollarSignIcon,
  SearchIcon,
} from "lucide-react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import {
  fetchPopularTasks,
  fetchTopFreelancers,
  newsletterSubscribeAction,
} from "@/lib/actions";
import { NewsletterForm } from "@/components/landing/NewsletterForm";
import { HowItWorksCard } from "@/components/landing/HowItWorksCard";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { AnimatedStatistics } from "@/components/landing/AnimatedStatistics";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { AnimatedTaskSection } from "@/components/landing/AnimatedTaskSection";
import { AnimatedFreelancerSection } from "@/components/landing/AnimatedFreelancerSection";
import { AnimatedTestimonials } from "@/components/landing/AnimatedTestimonials";
import { AnimatedCTA } from "@/components/landing/AnimatedCTA";
import { UserRole, Task as TaskType, User as UserType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Micro Freelance Marketplace - Connect, Collaborate, Create",
  description:
    "Find top freelance talent for your projects or offer your skills to clients worldwide. Secure payments, milestone tracking, and real-time communication.",
  openGraph: {
    title: "Micro Freelance Marketplace - Connect, Collaborate, Create",
    description:
      "Find top freelance talent for your projects or offer your skills to clients worldwide.",
    url: "https://your-marketplace.com",
    siteName: "Micro Freelance Marketplace",
    images: [
      {
        url: "https://your-marketplace.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Micro Freelance Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Micro Freelance Marketplace",
    description:
      "Find top freelance talent for your projects or offer your skills to clients worldwide.",
    creator: "@your_twitter_handle",
    images: ["https://your-marketplace.com/twitter-image.jpg"],
  },
};

// Server-side data fetching functions
async function getPopularTasks(): Promise<TaskType[] | undefined> {
  try {
    const response = await fetchPopularTasks();
    return response.success ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch popular tasks on homepage:", error);
    return [];
  }
}

async function getTopFreelancers(): Promise<UserType[] | undefined> {
  try {
    const response = await fetchTopFreelancers();
    return response.success ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch top freelancers on homepage:", error);
    return [];
  }
}

export default async function MarketingPage() {
  const popularTasksPromise = getPopularTasks();
  const topFreelancersPromise = getTopFreelancers();

  const [popularTasks, topFreelancers] = await Promise.all([
    popularTasksPromise,
    topFreelancersPromise,
  ]);

  const features = [
    {
      icon: <BriefcaseIcon className="h-7 w-7 text-primary-500" />,
      title: "Post & Discover Projects",
      description:
        "Easily define your project needs or explore a diverse range of tasks. Our intelligent matching helps you find the perfect fit.",
    },
    {
      icon: <CheckCircle2Icon className="h-7 w-7 text-primary-500" />,
      title: "Smart Bidding System",
      description:
        "Freelancers submit detailed proposals with transparent pricing. Clients can effortlessly compare and select the ideal candidate.",
    },
    {
      icon: <MessageCircleIcon className="h-7 w-7 text-primary-500" />,
      title: "Real-time Communication",
      description:
        "Collaborate efficiently with integrated chat, file sharing, and project workspace features.",
    },
    {
      icon: <PiggyBankIcon className="h-7 w-7 text-primary-500" />,
      title: "Secure Escrow Payments",
      description:
        "Funds are held securely in escrow and released only upon your complete satisfaction with delivered milestones.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <AnimatedHero />

      {/* Statistics Section */}
      <AnimatedStatistics />

      {/* How It Works Section */}
      <section className="container my-24">
        <AnimatedSection className="mb-16 text-center">
          <h2 className="text-display-md font-bold">How It Works</h2>
          <p className="text-body-lg mt-4 max-w-2xl mx-auto">
            Our platform simplifies the process of hiring and working. Follow
            these simple steps.
          </p>
        </AnimatedSection>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* For Clients */}
          <HowItWorksCard
            title="For Clients: Find Your Perfect Match"
            description="Access a pool of diverse talent, get competitive bids, and manage projects with ease."
            steps={[
              {
                icon: <BriefcaseIcon className="h-6 w-6" />,
                text: "Post your project details & budget.",
              },
              {
                icon: <UsersIcon className="h-6 w-6" />,
                text: "Receive bids from qualified freelancers.",
              },
              {
                icon: <CheckCircle2Icon className="h-6 w-6" />,
                text: "Select the best fit & assign.",
              },
              {
                icon: <MessageCircleIcon className="h-6 w-6" />,
                text: "Collaborate & track milestones.",
              },
              {
                icon: <AwardIcon className="h-6 w-6" />,
                text: "Approve work & release secure payments.",
              },
            ]}
            cta={
              <Link href="/dashboard/tasks/new" passHref>
                <Button
                  variant="gradient"
                  className="group shadow-primary dark:shadow-primary-dark"
                >
                  Post Your First Project{" "}
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            }
          />

          {/* For Freelancers */}
          <HowItWorksCard
            title="For Freelancers: Showcase Your Skills"
            description="Discover exciting projects, submit compelling bids, and grow your freelance career."
            steps={[
              {
                icon: <GraduationCapIcon className="h-6 w-6" />,
                text: "Create your detailed profile & portfolio.",
              },
              {
                icon: <SearchIcon className="h-6 w-6" />,
                text: "Browse and discover relevant projects.",
              },
              {
                icon: <HammerIcon className="h-6 w-6" />,
                text: "Submit winning bids with your proposals.",
              },
              {
                icon: <ListChecksIcon className="h-6 w-6" />,
                text: "Deliver milestones & get approved.",
              },
              {
                icon: <DollarSignIcon className="h-6 w-6" />,
                text: "Receive secure and timely payouts.",
              },
            ]}
            cta={
              <Link href="/tasks" passHref>
                <Button
                  variant="primary-outline"
                  className="border-primary-500 text-primary-500 group"
                >
                  Explore Projects{" "}
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            }
          />
        </div>
      </section>

      {/* Popular Tasks Section */}
      <AnimatedTaskSection popularTasks={popularTasks} />

      {/* Top Freelancers Section */}
      <AnimatedFreelancerSection topFreelancers={topFreelancers} />

      {/* Testimonials Section */}
      <AnimatedTestimonials />

      {/* Newsletter Signup */}
      <section className="container my-24 text-center max-w-2xl">
        <AnimatedSection className="space-y-6">
          <h2 className="text-display-md font-bold">Stay Updated</h2>
          <p className="text-body-lg">
            Subscribe to our newsletter for the latest projects, freelance tips,
            and platform updates.
          </p>
          <NewsletterForm />
        </AnimatedSection>
      </section>

      {/* Final Call to Action Section */}
      <AnimatedCTA />
    </div>
  );
}

// HowItWorksCard is now a separate component in components/landing/
