import Post from "../post/post"
import { useEffect, useState } from "react"
import { useWebsocket } from "../../context/websocket"
import "./active.css"
import { use } from "react"
function Upcoming({close_func, zoom_func, showprof}) {
    const { upcoming_requests,
        upcoming,id, setnotifyup } = useWebsocket()
        useEffect(() => {
            upcoming_requests(id)
        }
        , [])
        useEffect(()=>{
            setnotifyup(false)
        })
    return (
        <div className="upcoming">
            <div className="upcoming_header">
                <h2>Upcoming Requests</h2>
            </div>
            <div className="upcoming_body">
                {upcoming.map((request, index) => (
                    <Post
                        key={index}
                        close_func={close_func}
                        zoom_func={zoom_func}
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
export default Upcoming