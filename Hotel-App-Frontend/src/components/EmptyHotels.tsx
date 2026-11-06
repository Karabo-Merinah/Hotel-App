import { Texts } from "./Texts/texts"
import { SearchX } from "lucide-react"
import "../styles/EmptyHotels.css"

const EmptyHotels = () => {
    return (
        <div className="empty-hotels">
            <SearchX size={48} strokeWidth={1.5} />
            <Texts variant="h3">No hotels found</Texts>
            <Texts variant="p">We couldn't find any hotels matching your search. </Texts>
        </div>
    )
}
export default EmptyHotels
