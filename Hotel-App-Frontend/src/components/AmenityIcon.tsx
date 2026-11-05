import { Wifi, CarFront, Waves, Utensils, Snowflake, Dumbbell, Tv, Coffee, ConciergeBell, ShieldCheck, Flower2, PawPrint, Check } from "lucide-react"

interface AmenityIconProps {
    name: string
}

const AmenityIcon = ({ name }: AmenityIconProps) => {

   const amenity = name.toLowerCase()

if (amenity.includes("wifi") || amenity.includes("wi-fi")) return <Wifi size={20} className="amenity-icon" />
if (amenity.includes("parking")) return <CarFront size={20} className="amenity-icon" />
if (amenity.includes("pool")) return <Waves size={20} className="amenity-icon" />
if (amenity.includes("restaurant")) return <Utensils size={20} className="amenity-icon" />
if (amenity.includes("air conditioning")) return <Snowflake size={20} className="amenity-icon" />
if (amenity.includes("gym") || amenity.includes("fitness")) return <Dumbbell size={20} className="amenity-icon" />
if (amenity.includes("tv")) return <Tv size={20} className="amenity-icon" />
if (amenity.includes("breakfast")) return <Coffee size={20} className="amenity-icon" />
if (amenity.includes("room service")) return <ConciergeBell size={20} className="amenity-icon" />
if (amenity.includes("security")) return <ShieldCheck size={20} className="amenity-icon" />
if (amenity.includes("spa")) return <Flower2 size={20} className="amenity-icon" />
if (amenity.includes("pet")) return <PawPrint size={20} className="amenity-icon" />

return <Check size={20} className="amenity-icon" />
}

export default AmenityIcon