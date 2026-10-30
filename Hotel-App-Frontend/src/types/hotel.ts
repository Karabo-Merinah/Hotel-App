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
export interface FavouriteHotel {
    id: number
    name: string
    city: string
    address: string
    star_rating: number
    latitude: number | null
    longitude: number | null
    price_from: number | string | null
    main_image: string | null
}
export interface Notification {
    id: number
    message: string
    is_read: boolean
    created_at: string
}
export interface Review {
    id: number
    rating: number
    comment: string
    created_at: string
    reviewer_name: string
}

export interface HotelReviews {
    average_rating: number
    reviews_count: number
    reviews: Review[]
}