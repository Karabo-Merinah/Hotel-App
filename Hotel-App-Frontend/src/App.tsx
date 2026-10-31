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
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import PaymentSuccess from "./pages/PaymentSuccess";

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
        {/* public pages  */}

        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* protected pages  */}

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
        <Route path="/bookings/new/:roomId" element={<ProtectedBooking />} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/hotels/:hotelId/review" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;
