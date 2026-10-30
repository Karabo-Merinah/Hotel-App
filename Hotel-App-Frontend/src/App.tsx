import { BrowserRouter, Routes, Route } from "react-router-dom";
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
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/bookings/new/:roomId" element={<Booking />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;
