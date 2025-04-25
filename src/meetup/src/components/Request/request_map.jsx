import {useMapEvents} from "react-leaflet"
const SelectLocation = ({onsetlocation})=>{
    const map = useMapEvents({
        click(e) {
            onsetlocation(e.latlng)
        }
    })
    return (<></>)
}
export default SelectLocation