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
import BookingPayment from "./pages/BookingPayments"
import Navbar from "./components/Navbar"
import AdminRoute from "./components/AdminRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminNavbar from "./components/AdminNavbar"
import ManageHotels from "./pages/admin/ManageHotels"
import HotelForm from "./pages/admin/HotelForm"
import ManageBookings from "./pages/admin/ManageBookings"
import AdminBookingDetails from "./pages/admin/AdminBookingDetails"
import ManageRooms from "./pages/admin/ManageRooms"
import AdminProfilePage from "./pages/admin/AdminProfile"
import Footer from "./components/Footer"
import About from "./pages/About"
import Contact from "./pages/Contact"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import Terms from "./pages/Terms"
import AdminReviews from "./pages/admin/AdminReviews"
import Services from "./pages/Services"

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

const UserLayout = () => {
  const location = useLocation()
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname.startsWith("/admin")
  const hideFooter = hideNavbar

  return (
    <div className="app-layout">
      {!hideNavbar && <Navbar />}
      <main className="app-main">
      <Routes>
        {/* public pages  */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/services" element={<Services />} />
        {/* protected pages  */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
        <Route path="/bookings/new/:roomId" element={<ProtectedBooking />} />
        <Route path="/bookings/:id/payment" element={<ProtectedRoute><BookingPayment /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/hotels/:hotelId/review" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminNavbar /><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/hotels" element={<AdminRoute><AdminNavbar /><ManageHotels /></AdminRoute>} />
        <Route path="/admin/hotels/new" element={<AdminRoute><AdminNavbar /><HotelForm /></AdminRoute>} />
        <Route path="/admin/hotels/:id/edit" element={<AdminRoute><AdminNavbar /><HotelForm /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminNavbar /><ManageBookings /></AdminRoute>} />
        <Route path="/admin/bookings/:id" element={<AdminRoute><AdminNavbar /><AdminBookingDetails /></AdminRoute>} />
        <Route path="/admin/rooms" element={<AdminRoute><AdminNavbar /><ManageRooms /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminNavbar /><AdminProfilePage /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminNavbar /><AdminReviews /></AdminRoute>} />
      </Routes>     
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserLayout />
    </BrowserRouter>
  )
}
export default App;
