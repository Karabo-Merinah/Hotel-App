
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
