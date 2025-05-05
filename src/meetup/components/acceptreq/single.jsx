import { useEffect, useState } from "react";
import "./single.css";
function Single({ request, acceptor, showprof }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [user, setuser] = useState(null);

  useEffect(() => {
    fetch(`https://meetupserver-production.up.railway.app/download/${acceptor}`)
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          console.error("Error fetching image:", response.statusText);
          throw new Error("Image fetch failed");
        }
      })
      .catch((err) => {
        console.error("Error fetching image:", err);
        setImgSrc(null);
      })
      .then((blob) => {
        return blobToBase64(blob);
      })
      .then((base64) => {
        setImgSrc(base64);
      })
      .catch((error) => {
        console.error("Error converting blob to base64:", error);
        setImgSrc(null);
      });
  }, [acceptor]);

  if (!request || !acceptor) {
    console.error("Invalid request or acceptor data");
    return null;
  }

  console.log("res", request, "acc", acceptor);
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  };

  const {
    time = "N/A",
    purpose = "No purpose specified.",
    place = "Unnamed Location",
  } = request;

  const handleAcceptClick = (e) => {
    e.preventDefault();
    console.log("Accept button clicked");
    fetch(
      `https://meetupserver-production.up.railway.app/${acceptor}/${request.req_id}`
    ).then((response) => {
      if (response.ok) {
        console.log("Request accepted successfully");
      } else {
        console.error("Error accepting request:", response.statusText);
        throw new Error("Request acceptance failed");
      }
    });
    // Add your accept logic here
  };
  const handleRejectClick = () => {};
  return (
    <article
      className="acceptance-card"
      aria-labelledby={`accepter-name-${acceptor}`}
    >
      <div className="accepter-info">
        <img
          src={imgSrc}
          alt={`${acceptor}'s avatar`}
          className="accepter-avatar"
          onClick={(e) => {
            e.stopPropagation();
            showprof(acceptor);
          }}
        />
        <span id={`accepter-name-${acceptor}`} className="accepter-name">
          {acceptor}
        </span>
        <span className="accepter-prompt">wants to join:</span>
      </div>

      <div className="request-details">
        <p className="detail-purpose" title={purpose}>
          "{purpose.length > 60 ? `${purpose.substring(0, 60)}...` : purpose}"
        </p>
        <div className="detail-meta">
          <span className="detail-creator">(Your post)</span>
          <span className="detail-time">Time: {time}</span>
          <span className="detail-place">Place: {place}</span>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="action-button action-button--reject"
          onClick={handleRejectClick}
          aria-label={`Reject ${acceptor}'s request to join`}
          title={`Reject ${acceptor}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          className="action-button action-button--accept"
          onClick={handleAcceptClick}
          aria-label={`Accept ${acceptor}'s request to join`}
          title={`Accept ${acceptor}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fillRule="evenodd"
              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}

export default Single;
