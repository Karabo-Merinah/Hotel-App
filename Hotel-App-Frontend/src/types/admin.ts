
export interface AdminBooking {
    id: number
    user_id: number
    room_id: number
    check_in: string
    check_out: string
    status: string
}

export interface DashboardStats {
    total_hotels: number
    active_bookings: number
    available_rooms: number
    monthly_revenue: number
    recent_bookings: AdminBooking[]
}
export interface AdminReservation {
    id: number
    user_id: number
    room_id: number
    guest_name: string
    guest_email: string
    hotel_name: string
    room_type: string
    check_in: string
    check_out: string
    number_of_rooms: number
    number_of_guests: number
    total_price: string
    status: string
}