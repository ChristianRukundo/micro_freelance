import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoveRightIcon, CheckCircle2Icon, BriefcaseIcon, MessageCircleIcon, PiggyBankIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Metadata } from 'next';
import { Footer } from '@/components/layouts/Footer';

export const metadata: Metadata = {
  title: 'Micro Freelance Marketplace - Connect & Collaborate',
  description: 'Find top freelancers for your projects or offer your skills to clients worldwide. Secure payments, milestone tracking, and real-time communication.',
  openGraph: {
    title: 'Micro Freelance Marketplace - Connect & Collaborate',
    description: 'Find top freelancers for your projects or offer your skills to clients worldwide.',
    url: 'https://your-marketplace.com',
    images: [{ url: 'https://your-marketplace.com/og-home.jpg' }],
  },
  // Add more SEO tags
};


export default async function MarketingPage() {
  // Example of server-side data fetching (e.g., top categories, recent tasks)
  // const categories = await getTopCategories(); // Placeholder
  // const latestTasks = await getLatestTasks(); // Placeholder

  const features = [
    {
      icon: <BriefcaseIcon className="h-7 w-7 text-primary-500" />,
      title: 'Post & Discover Projects',
      description: 'Easily post your project requirements or browse a wide range of available tasks.',
    },
    {
      icon: <CheckCircle2Icon className="h-7 w-7 text-primary-500" />,
      title: 'Smart Bidding System',
      description: 'Freelancers submit detailed proposals, clients review and select the best fit.',
    },
    {
      icon: <MessageCircleIcon className="h-7 w-7 text-primary-500" />,
      title: 'Real-time Communication',
      description: 'Stay connected with built-in chat for seamless project collaboration.',
    },
    {
      icon: <PiggyBankIcon className="h-7 w-7 text-primary-500" />,
      title: 'Secure Escrow Payments',
      description: 'Funds are held securely and released upon milestone completion and approval.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex w-full flex-col items-center justify-center bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-neutral-50 py-20 text-center md:py-32"
      >
        <div className="container max-w-3xl space-y-6">
          <h1 className="text-display-lg font-extrabold tracking-tight text-neutral-900 drop-shadow-sm md:text-display-lg">
            Connect. Collaborate. Create.
          </h1>
          <p className="text-body-lg text-neutral-600">
            Your gateway to exceptional freelance talent and rewarding projects.
            Unlock a world of opportunities, securely and efficiently.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/tasks/new" passHref>
              <Button size="lg" variant="gradient" className="shadow-primary group">
                Post a Project
                <MoveRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/tasks" passHref>
              <Button size="lg" variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">
                Find Talent
              </Button>
            </Link>
          </div>
        </div>
        {/* Optional: Add a subtle background pattern or image */}
        {/* <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div> */}
      </motion.section>

      {/* Features Section */}
      <section className="container my-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 text-center"
        >
          <h2 className="text-display-md font-bold text-neutral-800">Why Choose Our Marketplace?</h2>
          <p className="text-body-md text-neutral-500 mt-3 max-w-2xl mx-auto">
            Experience seamless collaboration with features designed for efficiency and peace of mind.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="flex h-full flex-col items-center p-6 text-center shadow-soft transition-all hover:shadow-medium border-neutral-200">
                <CardHeader className="p-0 pb-4">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50/20 text-primary-500">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-h5 text-neutral-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-body-sm text-neutral-600 flex-grow p-0">
                  {feature.description}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full bg-gradient-to-r from-primary-500 to-primary-600 py-16 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="container max-w-4xl space-y-6"
        >
          <h2 className="text-display-md font-bold drop-shadow-sm">Ready to Get Started?</h2>
          <p className="text-body-lg">
            Join thousands of clients and freelancers building amazing things together.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" passHref>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white/10">
                Create Free Account
              </Button>
            </Link>
            <Link href="/tasks" passHref>
              <Button size="lg" variant="default" className="text-primary-500 bg-white hover:bg-neutral-100">
                Explore Projects
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer (Server Component) */}
      <Footer />
    </div>
  );
}