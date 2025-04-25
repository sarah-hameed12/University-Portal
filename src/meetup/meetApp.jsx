import logo from './logo.svg';
import './meetApp.css';
import react, {useState} from "react";
import Profile from "./components/profile/profile"
import Createrequest from "./components/Request/request"
import Post from "./components/post/post"
import Postmaster from "./components/post/post_master"
import Navbar from "./components/Navbar/Navbar"
import Pending from "./components/Pending/pending"
import Past from "./components/pastRequests/Past"
import Accept from "./components/acceptreq/accept"
import Upcoming from "./components/activeRequests/active"
import { useWebsocket } from "./context/websocket";
function App() {
  const {id, notifyup, notifyrec, notifyacc} = useWebsocket();
  const [is_prof_visible, set_prof_visible] = useState(false);
  const [is_creating_request, set_creating_request] = useState(false)
  const [zoomed_request, set_zoomed_request] = useState(null)
  const [has_interacted, set_interacted] = useState(false)
  const [myrequests, set_my_requests] = useState(false)
  const [prof_id, set_prof_id] = useState(id)
  const [editable, set_editable] = useState(false)
  const [req,setreq] = useState(null)
  const [accept,set_accept] = useState(false)
  const [pastr, setPastr] = useState(false)
  const [upcoming, setUpcoming] = useState(false)
  const [activeView, setActiveView] = useState("Profile");
  const [zoom_edit, set_zoom_edit] = useState(true)

  const show_accept = (id, req)=>{
    setUpcoming(false)
    setPastr(false)
    set_my_requests(false)
    set_interacted(false)
    set_accept(true)
    setActiveView("accept")
  }
  const hide_accept = ()=>{
    set_accept(false)
  }

  const show_interacted = ()=>{
    setUpcoming(false)
    setPastr(false)
    set_my_requests(false)
    set_accept(false)
    set_interacted(true)
  }
  const show_my_requests = ()=>{
    setUpcoming(false)
    set_interacted(false)
    set_accept(false)
    setPastr(false)
    set_my_requests(true)
  }
  const show_past = ()=>{
    setUpcoming(false)
    set_interacted(false)
    set_my_requests(false)
    set_accept(false)
    setPastr(true)
  }
  const hide_past = ()=>{
    setPastr(false)
  }

  const show_upcoming = ()=>{
    set_interacted(false)
    set_my_requests(false)
    set_accept(false)
    setPastr(false)
    setUpcoming(true)
  }
  const hide_upcoming = ()=>{
    setUpcoming(false)
  }
  const show_prof = (id, ed, request)=>{
    unzoom_func()
    console.log("showing profile")
    set_prof_id(id)
    set_editable(ed)
    set_prof_visible(true)
    setreq(request)
  }
  const hide_prof = (req)=>{
    if(req){
      console.log("zooming")
      zoom_func(req)
    }
    set_prof_visible(false)
  }
 
  const hide_create_request = ()=>{
    set_creating_request(false)
  }

  const show_create_request = ()=>{
    set_creating_request(true)
  }
  const [zoom,set_zoom] = useState(false)
  const zoom_func = (request, edita)=>{
    set_zoom_edit(edita)
    console.log("zoom")
    set_zoomed_request(request)
    set_zoom(true)
  }
  const unzoom_func = ()=>{
    console.log("unzoom")
    set_zoom(false)
  }

  const items = [
    {label: "Profile", onClick: ()=>{show_prof(id, true)}},
    {label: "Create Request", onClick: show_create_request, not: false},
    {label: "My Requests", onClick: show_my_requests, not: notifyrec},
    {label: "Pending Requests", onClick: show_interacted,},
    {label: "approval requests", onClick: show_accept, not: notifyacc},
    {label: "Request History", onClick: show_past},
    {label: "Upcoming Requests", onClick: show_upcoming, not: notifyup},
  ]
  const [nav_items, set_nav_items] = useState(items)
  
  return (
    <div className="App">
      <Navbar Navitems={items}/>
      <main className="main-content">
        {is_prof_visible && (<Profile close_func = {hide_prof} profile_info={{}} profile_id = {prof_id} edit = {editable} req = {req}/>)}
        {is_creating_request && (<Createrequest close_func={hide_create_request}/>)}
        {zoom && <Post close_func =  {unzoom_func} zoomed = {zoom}  request = {zoomed_request} zoom_func = {zoom_func} showprof={show_prof} editp = {zoom_edit}/>}
        {myrequests && <Postmaster close_func = {unzoom_func} zoom_func = {zoom_func} showprof={show_prof}/>}
        {has_interacted && <Pending close_func = {unzoom_func} zoom_fun = {zoom_func} showprof={show_prof}/>}
        {pastr && <Past close_func = {unzoom_func} zoom_fun = {zoom_func} showprof={show_prof}/>}
        {accept && <Accept showprof={show_prof}/>}
        {upcoming && <Upcoming close_func = {unzoom_func} zoom_func = {zoom_func} showprof={show_prof}/>}
        
        {!is_prof_visible && !is_creating_request && !zoom && !myrequests && !has_interacted && !pastr && !accept && !upcoming && (
          <div className="main-content-placeholder">
            <h2>Welcome</h2>
            <p>Select an option from the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
