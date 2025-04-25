import io from "socket.io-client";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
        const supabaseKey =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("first_enter")
let email = ""
try {
    console.log("enter")
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.log("problemmmmm")
        console.error("Error getting session:", error);
    }
    if (data.user) {
        email = data.user.email
    } else {
        console.log("No user found");
        throw new Error("No user found");
    }
} catch (error) {
    console.error("Error connecting to WebSocket:", error);
}
var csock;

if(email !== ""){
    console.log("herecon")
    csock = io("ws://localhost:3800", {
        "query": { "name": email, "pwd": "hello", "token": "a" }
    })
    csock.on("token", data => {
        localStorage.setItem("token", data)
    })

csock.name = email

csock.emit("con", {nam: email})
  
}

export default csock