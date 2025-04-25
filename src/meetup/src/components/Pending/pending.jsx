import { useWebsocket}   from "../../context/websocket";
import { use, useEffect } from "react";
import Post from "../post/post";
import "./pending.css"
function Pending({close_func, zoom_fun, showprof}) {
    const {interacted_state, reqaccept,id} = useWebsocket();
    useEffect(() => {
        reqaccept(id)
    }, [])
    console.log("interacted", interacted_state)
    return (
        <div className = "Pending">
            <div className="Pending_header">
                <h2>Pending Requests</h2>
            </div>
            <div className="Pending_body">
                {interacted_state.map((request, index) => (
                    <Post
                        key={index}
                        close_func={close_func}
                        zoom_func={zoom_fun}
                        request={request}
                        zoomed={false}
                        showprof={showprof}
                        editp={false}
                    />
                ))}
            </div>
        </div>
    )
}
export default Pending;