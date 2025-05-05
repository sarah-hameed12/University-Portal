import React, { useState, useEffect, useRef } from "react";
import "./profile.css";
//import default_img from "./temp.png"
import { useWebsocket } from "../../context/websocket";

function Profile_comp({ close_func, profile_info, profile_id, edit, req }) {
  //profile_info.img = "null";
  let default_img =
    profile_info.img ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-978409_1280.png";
  console.log(profile_id, "profile_id");
  const { id } = useWebsocket();
  let n_img;
  const [is_edditing, set_edit] = useState(false);
  const [form_data, set_form_data] = useState(profile_info);
  const [profile_data, set_profile_data] = useState(profile_info);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currenturl, seturl] = useState(n_img || default_img);
  const [curr_url1, seturl1] = useState(n_img || default_img);
  const fileInputRef = useRef(null);

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // Data URL will be here
      reader.onerror = reject;
      reader.readAsDataURL(blob); // Converts blob to base64 data URL
    });
  }
  useEffect(() => {
    console.log("start");
    fetch(
      `https://meetupserver-production.up.railway.app/download/${profile_id}`
    )
      .then((res) => {
        console.log("here");
        if (!res.ok) throw new Error("File not found");
        return res.blob();
      })
      .catch((err) => {
        console.log(err);
      })
      .then((blob) => {
        //console.log("blob",blob)
        return blobToBase64(blob);
      })
      .catch((err) => {
        console.log(err);
      })
      .then((n_m) => {
        const n_img = n_m;
        //console.log(n_img)
        seturl(n_img);
        seturl1(n_img);
        default_img = n_img;
      });
    fetch(
      `https://meetupserver-production.up.railway.app/download-text/${profile_id}`
    )
      .then((res) => {
        console.log("text");
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        set_form_data(data);
        set_profile_data(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []); // empty dependency array → runs only once on mount

  //const fileInputRef1 = useRef(null);
  //const fileInputRef2 = useRef(null);

  useEffect(() => {
    set_form_data(profile_data);
    if (!is_edditing) {
      setSelectedFile(null);
      seturl1(currenturl);
    }
    console.log(is_edditing, "kkk");
  }, [is_edditing, profile_data, currenturl]);

  const img_click = () => {
    fileInputRef.current.click();
  };
  const input_handler = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("socials.")) {
      const link = name.split(".")[1];
      set_form_data((old_form) => {
        return {
          ...old_form,
          socials: { ...old_form.socials, [link]: value },
        };
      });
    } else {
      set_form_data((old_form) => {
        return { ...old_form, [name]: value };
      });
    }
  };
  const submit_handler = async (event) => {
    console.log("submit");
    event.preventDefault();
    set_profile_data(form_data);
    set_edit(false);
    seturl(curr_url1);

    function dataURLtoBlob(dataURL) {
      if (typeof dataURL !== "string") {
        throw new TypeError(
          "Expected dataURL to be a string, got " + typeof dataURL
        );
      }

      // This regex has two capture groups:
      //   1: the mime‑type (e.g. "image/png")
      //   2: the base64 data
      const matches = dataURL.match(/^data:(.+);base64,(.*)$/);
      if (!matches) {
        throw new Error(
          "Invalid dataURL format. " +
            "Make sure you’re passing a proper data:…;base64,… string."
        );
      }

      const mime = matches[1];
      const b64 = matches[2];
      const binary = atob(b64);
      const len = binary.length;
      const buffer = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        buffer[i] = binary.charCodeAt(i);
      }

      return new Blob([buffer], { type: mime });
    }

    // implement api call to the server here
    const formDataa = new FormData();
    //formData.append("myfile",dataURLtoBlob(curr_url1)) // <<< PROBLEM HERE

    // ***** CORRECTED VERSION *****
    console.log(curr_url1);
    const blob = dataURLtoBlob(curr_url1);
    if (blob) {
      // --- Provide a filename as the third argument ---
      const fileExtension = blob.type.split("/")[1] || "bin"; // Get extension from MIME type (e.g., 'png')
      const filename = `upload.${fileExtension}`; // Construct a filename string
      formDataa.append("myfile", blob, filename); // Add the filename string
      // ----------------------------------------------
    } else {
      console.error("Failed to create Blob from Data URL. Upload aborted.");
      // Handle this error appropriately - maybe return or throw
      return; // Exit if blob creation failed
    }
    formDataa.append("profile", JSON.stringify(form_data));

    try {
      console.log(formDataa);
      console.log("Sending FormData with filename:"); // Log what you're sending
      const response = await fetch(
        `https://meetupserver-production.up.railway.app/upload_profile/${id}`,
        {
          method: "POST",
          body: formDataa,
        }
      );

      // ... rest of your try/catch block for handling the response ...
      if (!response.ok) {
        // Try to get error details
        let errorText = `Upload failed with status: ${response.status}`;
        try {
          const errorResult = await response.json(); // Or .text()
          errorText = errorResult.message || JSON.stringify(errorResult);
        } catch (e) {
          /* Ignore if parsing response body fails */
        }
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log("Upload Success:", result);
    } catch (error) {
      console.error("Error during profile upload fetch:", error);
    }
  };

  const press_cancel = () => {
    console.log("cancel");
    set_edit(false);
  };

  const press_edit = () => {
    console.log("pressing");
    set_edit(true);
    console.log(is_edditing);
  };
  const file_change = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      if (event.target.name === "img1") {
        setSelectedFile(file);
        reader.onloadend = () => {
          seturl1(reader.result);
        };

        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          seturl(default_img);
        };

        reader.readAsDataURL(file);
      }
    } else {
      //fill in
    }
  };

  return (
    <div className="profile_background">
      <div className="profile-info">
        <form onSubmit={submit_handler} className="my_frm1">
          <h2>{!is_edditing ? "User Profile" : "editing profile"}</h2>
          <div className="user-pictures">
            {is_edditing ? (
              <>
                <div className="picture">
                  <img
                    src={curr_url1}
                    alt="not found"
                    onClick={img_click}
                    className="pic"
                  />
                  <input
                    type="file"
                    name="img1"
                    ref={fileInputRef}
                    onChange={file_change}
                    style={{ display: "none" }}
                  ></input>
                </div>
              </>
            ) : (
              <>
                <div className="picture">
                  <img src={currenturl} alt="image_not found" className="pic" />
                </div>
              </>
            )}
          </div>
          <div className="profile-detail">
            {is_edditing ? (
              <>
                <div className="form_group">
                  <label htmlFor="name">
                    <strong>name: </strong>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={form_data.name}
                    onChange={input_handler}
                  />
                </div>

                <div className="form_group">
                  <label htmlFor="major">
                    <strong>major: </strong>
                  </label>
                  <input
                    type="text"
                    name="major"
                    id="major"
                    value={form_data.major}
                    onChange={input_handler}
                  />
                </div>

                <div className="form_group">
                  <label htmlFor="year">
                    <strong>year: </strong>
                  </label>
                  <input
                    type="text"
                    name="year"
                    id="year"
                    value={form_data.year}
                    onChange={input_handler}
                  />
                </div>

                <div className="form_group">
                  <label htmlFor="bio">
                    <strong>bio: </strong>
                  </label>
                  <textarea
                    type="text"
                    name="bio"
                    id="bio"
                    value={form_data.bio}
                    onChange={input_handler}
                  />
                </div>
              </>
            ) : (
              <>
                <h3>{profile_data.name}</h3>
                <p>
                  <strong>Major: </strong> {profile_data.major}
                </p>
                <p>
                  <strong>Year: </strong> {profile_data.year}
                </p>
                <p>
                  <strong>Bio: </strong> {profile_data.bio}
                </p>
              </>
            )}
          </div>
          {profile_info.socials && (
            <div className="socials">
              <h3>Scoial Media links</h3>
              {profile_info.socials.insta && (
                <a
                  href={profile_info.socials.insta}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}

              {profile_info.socials.fb && (
                <a
                  href={profile_info.socials.fb}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              )}

              {profile_info.socials.lkdin && (
                <a
                  href={profile_info.socials.lkdin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Linkedin
                </a>
              )}
            </div>
          )}
          <div className="profile_actions">
            {is_edditing ? (
              <>
                <button
                  type="button"
                  onClick={press_cancel}
                  className="button-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="button-save">
                  Save Changes
                </button>
              </>
            ) : (
              <>
                {edit && (
                  <button
                    type="button"
                    onClick={press_edit}
                    className="button-edit"
                  >
                    Edit Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    console.log("ending", req);
                    close_func(req);
                  }}
                  className="button-close"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile_comp;
