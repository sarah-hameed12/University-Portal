import React,{useState, useEffect} from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useWebsocket } from '../../context/websocket'; // Assuming you have a WebSocket context
// --- Icon Setup (Keep as before) ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import './post.css'; // Assuming you have a CSS file for styling
import default_img from "./temp.png"
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
const defaultIcon = L.Icon.Default.prototype;
// --- End Icon Setup ---

function Post({ close_func, zoom_func, zoomed, request, showprof, editp }) {
    console.log("sh", showprof)
    const [imgSrc, setImgSrc] = useState(default_img);
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Data URL will be here
            reader.onerror = reject;
            reader.readAsDataURL(blob); // Converts blob to base64 data URL
        });
    }
    const {removeRequest,id} = useWebsocket();
    useEffect(() => {   
        fetch(`http://localhost:5001/download/${request.id}`).then((response) => {
            if (response.ok) {
                return response.blob();
            } else {
                console.error("Error fetching image:", response.statusText);
                throw new Error("Image fetch failed");
            }
        }).catch((err)=>{
            console.error("Error fetching image:", err);
            setImgSrc(default_img);
        }).then((blob) => {
            return blobToBase64(blob);}).then((base64) => {
            setImgSrc(base64);
        }).catch((error) => {
            console.error("Error converting blob to base64:", error);
            setImgSrc(default_img);
        });
    }, []);



    if (!request || !request.location?.lat || !request.location?.lng) {
        console.error("Post component received invalid or incomplete request data:", request);
        return <div className="post-error">Error: Could not display post due to missing data.</div>;
    }
    console.log(request)

    const { img, name = 'Anonymous', time = 'N/A', purpose = 'No purpose specified.', group_size = 'N/A', place = 'Unnamed Location', location } = request;
    const { lat, lng } = location;



    // accept, reject logic
    const handleAccept = () => {
        console.log("Accept clicked for request:", request.req_id);
        console.log("Accepting request with ID:", request.req_id, id, request.id);
        fetch(`http://localhost:5001/accept_request/${id}/${request.req_id}`).then((response) => {
            if (response.ok) {
                console.log("Request accepted successfully");
                console.log(removeRequest)
                removeRequest(request.req_id);
                console.log("Request removed from state");
                close_func();
            } else {
                console.error("Error accepting request:", response.statusText);
                throw new Error("Request acceptance failed");
            }
        }).catch((error) => {
            console.error("Error accepting request:", error);
            alert("Error accepting request. Please try again later.");
        });
    };
    const handlereject = (e) => {
        e.stopPropagation();
        close_func();
    }

    // --- ZOOMED VIEW ---
    if (zoomed) {
        return (
            <div className="zoomed_overlay" role="presentation" onClick={(e)=>{
                e.stopPropagation()
                close_func()}}>
                <div className="zoomed_post_modal" role="dialog" aria-modal="true" aria-labelledby="zoomedPostTitle" onClick={(e) => e.stopPropagation()}>
                    <button className="zoomed_close_button" onClick={close_func} aria-label="Close post details">×</button>

                    {/* Scrollable Content Area */}
                    <div className="zoomed_post_content">
                        <div className="zoomed_sender_info">
                            <img src={imgSrc} alt={`${name}'s avatar`} className="zoomed_avatar" onClick={(e)=>{
                                e.stopPropagation()
                                showprof(request.id, false,request)
                                }
                            } />
                            <h2 id="zoomedPostTitle" className="zoomed_name">{name}</h2>
                        </div>

                        <div className="zoome/default-avatar.pngd_details_section">
                            <p className="zoomed_detail_item"><span className="detail_label">Time:</span> {time}</p>
                            <p className="zoomed_detail_item"><span className="detail_label">Group Size:</span> {group_size}</p>
                            <p className="zoomed_purpose_full"><span className="detail_label">Purpose:</span> {purpose}</p>
                            <p className="zoomed_detail_item"><span className="detail_label">Location:</span> {place}</p>
                        </div>

                        <div className="zoomed_map_container">
                            <MapContainer
                                className="leaflet_map zoomed_map"
                                center={[lat, lng]}
                                zoom={14}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[lat, lng]} icon={defaultIcon}>
                                    <Popup>{place}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div> {/* End Scrollable Content Area */}

                    {/* --- ACTION BUTTONS AREA --- */}
                    {editp && (
                    <div className="zoomed_post_actions">
                        <button
                            className="button button-decline"
                            onClick={handlereject}
                        >
                            Decline
                        </button>
                        <button
                            className="button button-accept"
                            onClick={handleAccept}
                        >
                            Accept Request
                        </button>
                    </div>)}
                     {/* --- END ACTION BUTTONS AREA --- */}

                </div>
            </div>
        );
    }

    // --- NORMAL (SUMMARY) VIEW ---
    // (JSX remains the same as the previous version)
    return (
        <article
            className="post_summary_card"
            onClick={() => {
                console.log("post_clicked", request);
                zoom_func(request, editp)}}
            role="button"
            tabIndex="0"
            aria-label={`View details for post by ${name}`}
        >
            <div className="post_summary_content">
                <div className="summary_sender_info">
                    <img src={imgSrc} alt="" className="summary_avatar" />
                    <h3 className="summary_name">{name}</h3>
                </div>
                <div className="summary_details">
                    <p className="summary_time">{time}</p>
                    <p className="summary_purpose_truncated">{purpose}</p>
                    <p className="summary_group_size">Group: {group_size}</p>
                </div>
                <div className="summary_map_area">
                    <p className="summary_place_label">{place}</p>
                    <div className="summary_map_container">
                        <MapContainer
                            className="leaflet_map summary_map"
                            center={[lat, lng]}
                            zoom={11}
                            scrollWheelZoom={false}
                            dragging={false}
                            zoomControl={false}
                            doubleClickZoom={false}
                            attributionControl={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[lat, lng]} icon={defaultIcon}></Marker>
                        </MapContainer>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default Post;