export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "USER" | "AGENT";
  createdAt: string;
  updatedAt: string;
  bookingsCount?: number;
  favoritesCount?: number;
  lastLogin?: string;
  bookings?: Booking[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  subLocation?: string;
  pricePerNight: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  images: string[];
  amenities: string[];
  outdoorFeatures: string[];
  activities: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  subLocation?: string;
  pricePerNight: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  images: string[];
  amenities: string[];
  outdoorFeatures: string[];
  activities: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  status: string;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  cleaningFee: number;
  serviceFee: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  property: Property;
  user: User;
}

export interface BookingWithDetails extends Booking {
  property: Property;
  user: User;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property?: Property;
}

export interface FavoriteWithProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
  property: Property;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface AgentStats {
  totalProperties: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  newPropertiesThisMonth?: number;
  newUsersThisMonth?: number;
  newBookingsThisMonth?: number;
  revenueThisMonth?: number;
  recentBookings: {
    id: string;
    propertyTitle: string;
    userName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: string;
  }[];
  topProperties: {
    id: string;
    title: string;
    location: string;
    subLocation?: string;
    pricePerNight: number;
    bookingsCount: number;
    revenue: number;
    bookings?: number;
  }[];
  topLocations?: {
    name: string;
    properties: number;
  }[];
  bookingsByLocation: {
    location: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  revenueData?: any[];
  bookingsData?: any[];
  userData?: any[];
}

export interface PropertySearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string | string[];
  outdoorFeatures?: string | string[];
  activities?: string | string[];
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PropertySearchResult {
  properties: Property[];
  totalPages: number;
  currentPage: number;
  totalProperties: number;
}
