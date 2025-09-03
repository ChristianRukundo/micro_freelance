import type React from "react"
import { Wifi, Tv, Car, Utensils, Waves, Snowflake, Flame, Dumbbell, Bath, Coffee, Gamepad2, Shirt } from "lucide-react"

interface PropertyAmenitiesProps {
  amenities: string[]
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  const amenityIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="h-5 w-5" />,
    tv: <Tv className="h-5 w-5" />,
    parking: <Car className="h-5 w-5" />,
    kitchen: <Utensils className="h-5 w-5" />,
    pool: <Waves className="h-5 w-5" />,
    ac: <Snowflake className="h-5 w-5" />,
    fireplace: <Flame className="h-5 w-5" />,
    gym: <Dumbbell className="h-5 w-5" />,
    jacuzzi: <Bath className="h-5 w-5" />,
    coffee: <Coffee className="h-5 w-5" />,
    gaming: <Gamepad2 className="h-5 w-5" />,
    laundry: <Shirt className="h-5 w-5" />,
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center gap-2">
            {amenityIcons[amenity] || <div className="w-5 h-5" />}
            <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
