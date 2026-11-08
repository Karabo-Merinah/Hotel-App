import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../../api/axios"
import "../../styles/HotelForm.css"
import { Texts } from "../../components/Texts/texts"
import type { HotelImage } from "../../types/hotel"
import Popup from "../../components/Popup"
import ConfirmDialog from "../../components/ConfirmDialog"


const HotelForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [starRating, setStarRating] = useState("1")
    const [policies, setPolicies] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [imageError, setImageError] = useState("")
    const [existingImages, setExistingImages] = useState<HotelImage[]>([])
    const [deletingImage, setDeletingImage] = useState(false)
    const [popup, setPopup] = useState("")
    const [confirmImageId, setConfirmImageId] = useState<number | null>(null)


    // loads hotel details when editing an existing hotel
    useEffect(() => {
        if (!id) return
        const getHotel = async () => {
            try {
                // get the selected hotel from the backend
                const response = await api.get(`/api/hotels/${id}`
                )
                const hotel = response.data
                // fill the form with the hotel's existing details
                setName(hotel.name || "")
                setDescription(hotel.description || "")
                setAddress(hotel.address || "")
                setCity(hotel.city || "")
                setLatitude(String(hotel.latitude || ""))
                setLongitude(String(hotel.longitude || ""))
                setStarRating(String(hotel.star_rating || 1))
                setPolicies(hotel.policies || "")
                setExistingImages(hotel.images || [])
            } catch (error) {
                console.log(error)
                setError("Could not load hotel details.")
            }
        }

        getHotel()
    }, [id])

    // delete a hotel image from the backend
    const deleteHotelImage = async (imageId: number) => {
        try {
            setDeletingImage(true)
            setImageError("")

            // get the admin authentication token
            const token = localStorage.getItem("token")
            // send the delete request to the backend
            await api.delete(`/api/hotels/images/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // remove the deleted image from the page
            setExistingImages(existingImages.filter((image) => image.id !== imageId))
            setPopup("Hotel image deleted successfully.")
        }
        catch (error) {
            console.log(error)
            setImageError("Could not delete hotel image.")
        }
        finally {
            setDeletingImage(false)
            setConfirmImageId(null)
        }
    }
    // save a new hotel or update an existing hotel
    const saveHotel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // clear previous errors and start loading
        setError("")
        setImageError("")
        setLoading(true)
        const token = localStorage.getItem("token")

        const hotelData = {
            name, description, address, city,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            star_rating: parseInt(starRating),
            policies
        }
        try {
            if (id) {
                // update the existing hotel
                await api.put(`/api/hotels/${id}`, hotelData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                await uploadHotelImages(parseInt(id))
            } else {
                const response = await api.post("/api/hotels", hotelData, { headers: { Authorization: `Bearer ${token}` } }
                )
                // upload any newly selected images
                await uploadHotelImages(response.data.id)
            }
            navigate("/admin/hotels", {
                state: { popup: id ? "Hotel updated successfully!" : "Hotel added successfully!" }
            })
        } catch (error) {
            console.log(error)
            setError("Could not complete saving the hotel. Check whether the hotel was already saved before retrying.")
        } finally {
            setLoading(false)
        }
    }

    // upload selected hotel images
    const uploadHotelImages = async (hotelId: number) => {
        // skip uploading when no images are selected
        if (selectedImages.length === 0) {
            return
        }
        try {
            setUploading(true)
            setImageError("")

            const token = localStorage.getItem("token")
            // upload each selected image
            for (const image of selectedImages) {
                const formData = new FormData()
                formData.append("image", image)
                await api.post(`/api/hotels/${hotelId}/images`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            setSelectedImages([])
        } catch (error) {
            console.log(error)
            setImageError("Could not upload hotel images. The hotel may already have been saved.")
            throw error
        } finally {
            setUploading(false)
        }
    }

    useEffect(() => {
        if (!popup) return
        const timer = setTimeout(() => setPopup(""), 3000)
        return () => clearTimeout(timer)
    }, [popup])

    return (
        <div className="admin-hotel-form-page">
            {/* Ask for confirmation before deleting a hotel image */}
            {popup && <Popup message={popup} type="success" onClose={() => setPopup("")} />}
            {confirmImageId !== null && (
                <ConfirmDialog title="Delete Hotel Image" message="Are you sure you want to delete this hotel image?" onConfirm={() => deleteHotelImage(confirmImageId)} onClose={() => setConfirmImageId(null)} loading={deletingImage} />
            )}
            <div className="admin-hotel-form-header">
                <Texts variant="h1">{id ? "Edit Hotel" : "Add Hotel"}</Texts>
                <Texts variant="p">Manage accommodation details and information.</Texts>
            </div>
            <form className="admin-hotel-form" onSubmit={saveHotel}>
                <Texts variant="h2">Hotel Information</Texts>
                <label htmlFor="hotel-name">Hotel Name</label>
                <input id="hotel-name" value={name} onChange={(e) => setName(e.target.value)} required />
                <label htmlFor="hotel-description">Description</label>
                <textarea id="hotel-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                <label htmlFor="hotel-address">Address</label>
                <input id="hotel-address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                <label htmlFor="hotel-city">City</label>
                <input id="hotel-city" value={city} onChange={(e) => setCity(e.target.value)} required />
                <div className="hotel-form-images">
                    <Texts variant="h3">Hotel Images</Texts>
                    {existingImages.length > 0 && (
                        <div className="hotel-existing-images">
                            {existingImages.map((image) => (
                                <div className="hotel-existing-image" key={image.id}>
                                    <img src={image.image_url} alt="Hotel" />
                                    <button type="button" onClick={() => setConfirmImageId(image.id)} disabled={deletingImage}>Delete Image</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <label htmlFor="hotel-images">Upload hotel pictures</label>
                    <input id="hotel-images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setSelectedImages(Array.from(e.target.files || []))} />
                    <Texts variant="p">You can select multiple hotel images.</Texts>
                    {selectedImages.length > 0 && (
                        <div className="hotel-selected-images">
                            {selectedImages.map((image, index) => (
                                <div key={index}>
                                    <Texts variant="p">{image.name}</Texts>
                                </div>
                            ))}
                        </div>
                    )}
                    {imageError && <Texts variant="p">{imageError}</Texts>}
                </div>
                {/* Hotel location coordinates */}
                <div className="admin-hotel-form-row">
                    <div>
                        <label htmlFor="hotel-latitude">Latitude</label>
                        <input id="hotel-latitude" type="number" step="any" min="-90" max="90" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                    </div>
                    <div>
                        <label htmlFor="hotel-longitude">Longitude</label>
                        <input id="hotel-longitude" type="number" step="any" min="-180" max="180" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                    </div>
                </div>
                <label htmlFor="hotel-rating">Star Rating</label>
                <select id="hotel-rating" value={starRating} onChange={(e) => setStarRating(e.target.value)}>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                </select>
                <label htmlFor="hotel-policies">Hotel Policies</label>
                <textarea id="hotel-policies" value={policies} onChange={(e) => setPolicies(e.target.value)} rows={4} />
                <div className="admin-hotel-form-actions">
                    <button type="button" className="admin-hotel-cancel" onClick={() => navigate("/admin/hotels")}>Cancel</button>
                    <button type="submit" disabled={loading || uploading}>{loading || uploading ? "Saving..." : id ? "Save Changes" : "Add Hotel"}</button>
                </div>
                {error && (
                    <div className="admin-hotel-error">
                        <Texts variant="p">{error}</Texts>
                    </div>
                )}
            </form>
        </div>
    )
}

export default HotelForm
