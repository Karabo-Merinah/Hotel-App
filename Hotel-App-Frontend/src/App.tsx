import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/homepage";
import HotelDetails from "./pages/hotelDetails";
import RoomDetails from "./pages/roomDetails";
import Booking from "./pages/Booking";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/bookings/new/:roomId" element={<Booking />} />
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App;
