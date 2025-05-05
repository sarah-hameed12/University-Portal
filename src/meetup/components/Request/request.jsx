import react, { useState, useRef, useEffect } from "react";
import default_img from "./temp.png";
import "./request.css";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import Mapselect from "./request_map";
import { useWebsocket } from "../../context/websocket";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { set } from "mongoose";

delete L.Icon.Default.prototype._getIconUrl;

// Merge the new options into the default icon settings
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl, // URL for high-resolution screens
  iconUrl: iconUrl, // URL for standard resolution screens
  shadowUrl: shadowUrl, // URL for the marker shadow
});

const Create_Request = ({ close_func }) => {
  const { id } = useWebsocket();
  const initial_request = {
    name: "",
    place: "",
    time: "",
    purpose: "",
    group_size: "2",
  };
  const [curr_img, set_img] = useState(default_img);
  const File_ref = useRef(null);
  const [form_data, set_form_data] = useState(initial_request);
  const [pin_location, set_pin_location] = useState({
    lat: 31.47,
    lng: 74.4111,
  });
  useEffect(() => {
    set_form_data((old) => {
      let a = "2";
      return { ...old, [group_size]: a };
    });
  }, []);
  console.log(id);
  const handle_submit = (event) => {
    event.preventDefault();
    set_img(default_img);
    fetch("https://meetupserver-production.up.railway.app/upload_request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form_data.name,
        place: form_data.place,
        time: form_data.time,
        purpose: form_data.purpose,
        group_size: form_data.group_size,
        location: pin_location,
        id: id,
      }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Request sent successfully");
        } else {
          console.error("Error sending request");
        }
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
    close_func();
  };

  const handle_img = (event) => {
    console.log("here_img");
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        set_img(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handle_form = (event) => {
    const { name, value } = event.target;
    set_form_data((old_form) => {
      return { ...old_form, [name]: value };
    });
  };
  const handle_click = () => {
    console.log("here");
    File_ref.current.click();
  };

  return (
    <div className="request_background">
      <form onSubmit={handle_submit} className="request_form">
        <div className="images">
          <img
            className="pic"
            src={curr_img}
            onClick={handle_click}
            alt="not found"
          />
          <input
            type="file"
            ref={File_ref}
            style={{ display: "none" }}
            onChange={handle_img}
            accept="image/*"
          />
        </div>
        <div className="form_text_fields">
          <label htmlFor="name">
            <strong>Name: </strong>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form_data.name}
            onChange={handle_form}
          />

          <label htmlFor="place">
            <strong>Place: </strong>
          </label>
          <input
            type="text"
            id="place"
            name="place"
            value={form_data.place}
            onChange={handle_form}
          />

          <label htmlFor="time">
            <strong>Time: </strong>
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={form_data.time}
            onChange={handle_form}
          />

          <label htmlFor="purpose">
            <strong>Purpose: </strong>
          </label>
          <input
            type="text"
            id="purpose"
            name="purpose"
            value={form_data.purpose}
            onChange={handle_form}
          />

          <label htmlFor="group_size">
            <strong>Group size: </strong>
          </label>
          <input
            type="text"
            id="group_size"
            name="group_size"
            value={form_data.group_size}
            style={{
              opacity: 0.5,
              cursor: "not-allowed",
              pointerEvents: "none",
            }}
            onChange={handle_form}
          />
        </div>
        <div className="map-section">
          <label>
            <strong>Map</strong>
          </label>
          <div className="Map-container">
            <MapContainer
              center={[31.47, 74.4111]}
              zoom={15}
              scrollWheelZoom={true}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Mapselect onsetlocation={set_pin_location} />
              <Marker position={[31.47, 74.4111]}>
                <Popup>LUMS</Popup>
              </Marker>
              {pin_location && <Marker position={pin_location} />}
            </MapContainer>
          </div>
        </div>
        <div className="buttons">
          <button onClick={close_func} type="button" className="cancel">
            {" "}
            Go_back{" "}
          </button>
          {form_data.group_size !== "" &&
          form_data.name !== "" &&
          form_data.place !== "" &&
          form_data.time !== "" ? (
            <button type="submit" className="submit">
              Submit
            </button>
          ) : (
            <button
              type="button"
              className="submit"
              style={{
                opacity: 0.5,
                cursor: "not-allowed",
                pointerEvents: "none",
              }}
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Create_Request;
