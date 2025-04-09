import io from "socket.io-client";

localStorage.setItem("token", "a")
if (localStorage.getItem("token") === "a")
{
    var csock = io("ws://localhost:3800", {
        "query": {"name": "", "pwd" : "hello", "token": ""}})
    csock.on("token", data => {
        localStorage.setItem("token", data)
    })
}
else{
var csock = io("ws://localhost:3800", {
    "query": {"name": "" , "token" :localStorage.getItem("token"), "pwd" : "hello"}})
}
csock.on("token", data => {
    localStorage.setItem("token", data.token)
    csock.name = data.name
    //console.log(csock.name)
})

export default csock