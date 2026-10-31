import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/homepage";
import HotelDetails from "./pages/hotelDetails";
import RoomDetails from "./pages/roomDetails";
import Booking from "./pages/Booking";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import Favourites from "./pages/Favourites";
import Notifications from "./pages/Notifications";
import WriteReview from "./pages/WriteReview";


const ProtectedBooking = () => {
  const location = useLocation()
  const token = localStorage.getItem("token")
  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname, ...location.state }} />
    )
  }
  return <Booking />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/bookings/new/:roomId" element={<ProtectedBooking />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/hotels/:hotelId/review" element={<WriteReview />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;
