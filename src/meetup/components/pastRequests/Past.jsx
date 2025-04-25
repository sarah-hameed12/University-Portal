import { useWebsocket }  from "../../context/websocket";
import { useEffect } from "react";
import Post from "../post/post";
import "./Past.css"
function Past({close_func, zoom_fun, showprof}) {
    const {personel_requests, reqPersonnel,id} = useWebsocket();
    console.log("personel", personel_requests)
    useEffect(() => {
        reqPersonnel(id);
    }, []);
    console.log("personel", personel_requests)
    return (
        <div className = "Personnel">
            <div className="Personnel-header">
                <h2>Past Requests</h2>
            </div>
            <div className="Personnel-body">
                {personel_requests.map((request, index) => (
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
export default Past;