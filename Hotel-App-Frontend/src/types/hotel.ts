export interface Hotel {
    id: number
    name: string
    description: string
    address: string
    city: string
    star_rating: number
}
export interface Room {
    id: number
    hotel_id: number
    room_type: string
    description: string
    capacity: number
    price_per_night: number
    total_rooms: number
}