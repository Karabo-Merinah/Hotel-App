import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/homepage";
import HotelDetails from "./pages/hotelDetails";
import RoomDetails from "./pages/roomDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;
