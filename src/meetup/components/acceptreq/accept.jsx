import { useWebsocket } from "../../context/websocket";
import { useEffect } from "react";
import Single from "./single"
import "./accept.css"
function Accept({showprof}){
    const {accept_request, reqpending, id, setnotifyacc} = useWebsocket();
    console.log("accept_request", reqpending)
    useEffect(()=>{
        setnotifyacc(false)
    })
    useEffect(()=>{
        reqpending(id)
    },[])
    useEffect(()=>{console.log("Accept",accept_request)}, [accept_request])

    console.log("accept", accept_request)
    return (
        <div className="accept">
            <div className="accept_header">
                <h2>Accepted Requests</h2>
            </div>
            <div className="accept_body">
                {accept_request.map((request, index) => {
                    console.log("request", request,request.req, request.id)
                    return(
                
                    <Single
                        key={index}
                        request={request.req}
                        acceptor = {request.id}
                        showprof={showprof}
                    />
                )})}
            </div>
        </div>
    )
}
export default Accept