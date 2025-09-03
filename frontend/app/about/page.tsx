import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - Tura Heza",
  description:
    "Learn more about Tura Heza and our mission to provide luxury rentals in Rwanda.",
};

const TeamMemberCard = ({
  src,
  alt,
  name,
  title,
}: {
  src: string;
  alt: string;
  name: string;
  title: string;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative h-40 w-40 overflow-hidden rounded-full mb-4 shadow-lg">

      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <h3 className="font-semibold text-lg text-foreground">{name}</h3>
    <p className="text-sm text-muted-foreground">{title}</p>
  </div>
);

const AboutPage = () => {
  return (
    <div className="container mx-auto py-20 px-4">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="md:order-2">
          <div className="overflow-hidden rounded-lg shadow-2xl">
            <Image
              src="/about-image.png"
              alt="Luxury villa poolside"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        <div className="md:order-1">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Our Story</h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Tura Heza was founded in 2023 with a vision to redefine luxury
            property rentals in Rwanda. We saw an opportunity to connect
            discerning travelers with exceptional homes and provide unparalleled
            service.
          </p>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Our team is passionate about showcasing the beauty and culture of
            Rwanda while ensuring our guests experience the utmost comfort and
            convenience.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">
              Contact Us <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-24 text-center">
        <h2 className="text-3xl font-semibold mb-6 text-foreground">
          Our Mission
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-lg">
          To provide exceptional experiences through luxury property rentals,
          connecting guests with the best of Rwanda while supporting local
          communities and promoting sustainable tourism.
        </p>
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-semibold mb-12 text-center text-foreground">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
          <TeamMemberCard
            src="/thomas.jpg"
            alt="Portrait of Christian Rukundo"
            name="Christian Rukundo"
            title="Founder & CEO"
          />
          <TeamMemberCard
            src="https://images.unsplash.com/photo-1548637724-cbc39e0c8d3b?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Portrait of Uwimfura Zam Zam"
            name=" Léonie Adams "
            title="Head of Operations"
          />
          <TeamMemberCard
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=461&q=80"
            alt="Portrait of Richard Roe"
            name=" Samantha Abernathy"
            title="Marketing Manager"
          />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-semibold mb-12 text-center text-foreground">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-semibold text-xl mb-2 text-foreground">
              Excellence
            </h3>
            <p className="text-muted-foreground">
              We are committed to providing the highest quality properties and
              services, exceeding expectations at every turn.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2 text-foreground">
              Integrity
            </h3>
            <p className="text-muted-foreground">
              We operate with complete transparency, honesty, and ethical
              practices in all of our interactions.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2 text-foreground">
              Sustainability
            </h3>
            <p className="text-muted-foreground">
              We promote responsible tourism that respects the environment and
              supports the vibrant local communities of Rwanda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
