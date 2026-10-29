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
    images?: RoomImage[]
}
export interface RoomImage {
    id: number
    room_id: number
    image_url: string
    alt_text: string
}
export interface Booking {
    id: number
    user_id: number
    room_id: number
    hotel_name: string
    room_type: string
    check_in: string
    check_out: string
    number_of_rooms: number
    number_of_guests: number
    total_price: number | string
    status: string
    created_at: string
}