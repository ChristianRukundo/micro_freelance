"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { motion } from "framer-motion";
import { FadeIn, SlideUp } from "@/components/animations";


const ContactInfoItem = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    className="flex items-start gap-4"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex-shrink-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-1 text-muted-foreground">{children}</div>
    </div>
  </motion.div>
);

const ContactPage = () => {
  return (
    <div className="bg-background">
      <div className="relative bg-muted/40 pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Get In Touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              We're here to help you plan your perfect getaway in Rwanda. Reach
              out with any questions, and we'll get back to you as soon as
              possible.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <SlideUp className="space-y-12">
            <div className="space-y-8">
              <ContactInfoItem icon={Phone} title="Call Us">
                <a
                  href="tel:+250788123456"
                  className="hover:text-primary transition-colors"
                >
                  +250 788 123 456
                </a>
                <p className="text-sm">Mon - Fri, 9am - 5pm CAT</p>
              </ContactInfoItem>

              <ContactInfoItem icon={Mail} title="Email Us">
                <a
                  href="mailto:contact@turaheza.com"
                  className="hover:text-primary transition-colors"
                >
                  contact@turaheza.com
                </a>
                <p className="text-sm">We reply within 24 hours</p>
              </ContactInfoItem>

              <ContactInfoItem icon={MapPin} title="Our Office">
                <p>KN 5 Rd, Kigali, Rwanda</p>
                <p className="text-sm">Near the Kigali Convention Centre</p>
              </ContactInfoItem>
            </div>

            <div className="h-96 w-full overflow-hidden rounded-2xl shadow-lg ">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.52569612269!2d30.09212007496706!3d-1.9416248980315904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca6a436511335%3A0x46a83688b1b22578!2sKigali%20Convention%20Centre!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tura Heza Office Location"
              ></iframe>
            </div>
          </SlideUp>


          <SlideUp
            delay={0.2}
            className="rounded-2xl  bg-card p-8 shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Send us a Message
            </h2>
            <ContactForm />
          </SlideUp>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
