import {
  PrismaClient,
  Role,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const PROPERTY_NAMES = [
  "Cozy Apartment in Kigali Center",
  "Luxury Villa with Lake Kivu View",
  "Charming Guesthouse near Volcanoes National Park",
  "Modern Studio in Musanze",
  "Spacious Family House in Rubavu",
  "Tranquil Cottage in Nyungwe Forest",
  "Elegant Residence in Gasabo",
  "Budget-Friendly Stay in Huye",
  "Scenic Lodge near Akagera National Park",
  "Comfortable Home in Muhanga",
  "Beautiful Bungalow in Rusizi",
  "Hillside Retreat in Gisenyi",
  "City View Condo in Nyamirambo",
  "Rustic Cabin in Kinigi",
  "Serene Farmhouse in Kayonza",
  "Stylish Flat in Remera",
  "Garden View Apartment in Kibuye",
  "Riverside House in Cyangugu",
  "Panoramic Suite in Byumba",
  "Convenient Stay near the Airport",
];

const RWANDA_LOCATIONS = [
  "Kigali",
  "Musanze",
  "Rubavu",
  "Huye",
  "Gisenyi",
  "Rwamagana",
  "Kibuye",
  "Byumba",
  "Cyangugu",
  "Nyanza",
];

const TOURIST_ATTRACTIONS = [
  "Volcanoes National Park",
  "Lake Kivu",
  "Nyungwe Forest National Park",
  "Akagera National Park",
  "Kigali Genocide Memorial",
];

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
];

const getRandomImage = () =>
  IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log("🌱 Seeding database with real-ish data...");

  const users = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.user.create({
        data: {
          id: uuidv4(),
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: "password123",
          image: getRandomImage(),
          role: i < 10 ? "AGENT" : "USER",
        },
      })
    )
  );

  const agents = users.filter((u) => u.role === Role.AGENT);
  const regularUsers = users.filter((u) => u.role === Role.USER);

  const properties = await Promise.all(
    Array.from({ length: 100 }).map((_, i) => {
      const agent = agents[i % agents.length];
      const propertyName = PROPERTY_NAMES[i % PROPERTY_NAMES.length];
      const location = getRandomElement(TOURIST_ATTRACTIONS);
      const subLocation = getRandomElement(RWANDA_LOCATIONS);

      return prisma.property.create({
        data: {
          title: propertyName,
          description: `A beautiful property in ${location} with great views.`,
          location: location,
          subLocation: subLocation,
          pricePerNight: Math.floor(Math.random() * 451) + 50,
          guests: Math.floor(Math.random() * 10) + 1,
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 4) + 1,
          squareMeters: Math.floor(Math.random() * 231) + 20,
          images: Array.from({ length: 3 }).map(getRandomImage),
          amenities: ["WiFi", "Air Conditioning", "Kitchen"],
          outdoorFeatures: ["Balcony", "Garden"],
          activities: ["Hiking", "Local Tours"],
          agentId: agent.id,
          coordinates: {
            lat: parseFloat((Math.random() * 2 - 2).toFixed(6)),
            lng: parseFloat((Math.random() * 5 + 28).toFixed(6)),
          },
        },
      });
    })
  );

  const bookings = await Promise.all(
    Array.from({ length: 50 }).map((_, i) => {
      const user = regularUsers[i % regularUsers.length];
      const property = properties[i % properties.length];
      const checkIn = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const checkOut = new Date(
        checkIn.getTime() +
          (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000
      );
      const guests = Math.floor(Math.random() * property.guests) + 1;

      const price = property.pricePerNight;
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const cleaningFee = 100;
      const serviceFee = parseFloat((price * 0.05).toFixed(2));
      const totalAmount = parseFloat(
        (nights * price + cleaningFee + serviceFee).toFixed(2)
      );

      return prisma.booking.create({
        data: {
          userId: user.id,
          propertyId: property.id,
          checkIn,
          checkOut,
          guests,
          cleaningFee,
          serviceFee,
          totalAmount,
          status: "confirmed",
        },
      });
    })
  );

  await Promise.all(
    bookings.map((booking, i) => {
      const methods = Object.values(PaymentMethod);
      const statuses = Object.values(PaymentStatus);
      const paidAt = new Date(
        booking.checkIn.getTime() -
          (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000
      );

      return prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          method: getRandomElement(methods),
          status: getRandomElement(statuses),
          transactionId: uuidv4(),
          paidAt: paidAt,
        },
      });
    })
  );

  console.log("✅ Done seeding with realistic data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
