import { useEffect, useState } from "react";
import { useWebsocket } from "../../context/websocket";
import Post from "./post";
import "./post_master.css";
function Post_master({close_func,zoom_func,showprof}) {
    console.log("show",showprof)
    const [post, set_post] = useState([])
    const {connected, my_requests, requestRequests,id, setnotifyrec} = useWebsocket();
    const [loading, set_loading] = useState(true)
    const [error, set_error] = useState(null)
    //console.log("rm", removeRequest)
    useEffect(()=>{
      setnotifyrec(false)
    })
    useEffect(() => {
        if (connected) {
            requestRequests(id);
            console.log("requesting my requests");
        }
    }, [connected]);
    return (
        // Add className to the root div if it doesn't have one
        <div className="post_master">
          <div className="post_master_header">
            <h2>My Requests</h2>
          </div>
          <div className="post_master_body">
            {my_requests && my_requests.length === 0 ? (
              <p className="no-requests-message">You have no pending requests.</p>
            ) : (
              my_requests.map((request, index) => (
                <Post
                  key={request.req_id || index}
                  close_func={close_func}
                  zoom_func={zoom_func}
                  request={request}
                  zoomed={false}
                  showprof={showprof}
                  editp={true}
                />
              ))
            )}
          </div>
        </div>
      );
    }
    
export default Post_master;

