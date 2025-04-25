import SendEmail from "./SendEmail";
import TrackEmail from "./TrackEmail";
import Notifications from "./Notifications";
// import './App.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Email Dashboard</h1>
      <div className="grid">
        <SendEmail />
        <TrackEmail />
        <Notifications />
      </div>
    </div>
  );
}
