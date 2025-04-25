import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiMic,
  FiMicOff,
  FiUser,
  FiUsers,
  FiX,
  FiHeadphones,
  FiVolume2,
} from "react-icons/fi";
import styles from "../Styles/VoiceChannel.module.css";

// ICE configuration (STUN servers)
const iceConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VoiceChannel = ({ currentUser }) => {
  const { communityId, channelId } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [activeSpeakers, setActiveSpeakers] = useState({});

  
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const audioElementsRef = useRef({});
  const speechDetectionIntervalRef = useRef(null);

  
  const [debug, setDebug] = useState([]);
  const logEvent = (event) => {
    setDebug((prev) => [
      ...prev.slice(-10),
      `[${new Date().toLocaleTimeString()}] ${event}`,
    ]);
    console.log(`Voice Event: ${event}`);
  };

 
  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8001/api/feed/voice-channels/${channelId}/`
        );
        setChannel(response.data);

        
        const participantsResponse = await axios.get(
          `http://127.0.0.1:8001/api/feed/voice-channels/${channelId}/participants/`
        );
        setParticipants(participantsResponse.data);
      } catch (err) {
        console.error("Failed to fetch voice channel:", err);
        navigate(`/communities/${communityId}`);
      }
    };

    if (channelId && currentUser?.id) {
      fetchChannelDetails();
    }
  }, [channelId, communityId, navigate, currentUser]);

  
  useEffect(() => {
    if (!channelId || !currentUser?.id || !channel) return;

    
    const initUserMedia = async () => {
      try {
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        setLocalStream(stream);

        
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        microphone.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkIfSpeaking = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

          
          const isSpeaking = average > 15; 

          
          setActiveSpeakers((prev) => ({
            ...prev,
            [currentUser.id]: isSpeaking,
          }));

          
        };

       
        speechDetectionIntervalRef.current = setInterval(checkIfSpeaking, 100);

       
        initWebSocket(stream);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert(
          "Could not access microphone. Voice chat requires microphone permissions."
        );
        navigate(`/communities/${communityId}`);
      }
    };

    
    const initWebSocket = (stream) => {
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${wsScheme}://127.0.0.1:8001/ws/voice/${channelId}/?user_id=${
        currentUser.id
      }&display_name=${encodeURIComponent(
        currentUser.email || currentUser.id
      )}`;

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        logEvent("WebSocket connection established");

       
        axios
          .post(
            `http://127.0.0.1:8001/api/feed/voice-channels/${channelId}/participants/`,
            {
              user_id: currentUser.id,
              display_name: currentUser.email || currentUser.id,
            }
          )
          .catch((err) =>
            console.error("Error registering as participant:", err)
          );
      };

      socket.onclose = (event) => {
        logEvent(`WebSocket closed: ${event.code} ${event.reason}`);
      };

      socket.onerror = (error) => {
        logEvent(`WebSocket error: ${error.message}`);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleSocketMessage(data, stream);
      };

      socketRef.current = socket;
    };

   
    const handleSocketMessage = (data, stream) => {
      switch (data.type) {
        case "user_joined":
          logEvent(`User joined: ${data.display_name}`);
          handleUserJoined(data.user_id, data.display_name, stream);
          break;

        case "user_left":
          logEvent(`User left: ${data.user_id}`);
          handleUserLeft(data.user_id);
          break;

        case "offer":
          logEvent(`Received offer from: ${data.from_user_id}`);
          handleOffer(data.from_user_id, data.offer, stream);
          break;

        case "answer":
          logEvent(`Received answer from: ${data.from_user_id}`);
          handleAnswer(data.from_user_id, data.answer);
          break;

        case "ice_candidate":
          logEvent(`Received ICE candidate from: ${data.from_user_id}`);
          handleIceCandidate(data.from_user_id, data.candidate);
          break;

        case "mute_change":
          logEvent(
            `User ${data.user_id} ${data.is_muted ? "muted" : "unmuted"}`
          );
          handleMuteChange(data.user_id, data.is_muted);
          break;

        default:
          console.log("Unknown message type:", data);
      }
    };

    
    initUserMedia();

    
    return () => {
     
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      
      if (socketRef.current) {
        socketRef.current.close();
      }

      
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        if (pc) pc.close();
      });

      
      if (speechDetectionIntervalRef.current) {
        clearInterval(speechDetectionIntervalRef.current);
      }

      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      
      if (channelId && currentUser?.id) {
        axios
          .delete(
            `http://127.0.0.1:8001/api/feed/voice-channels/${channelId}/?user_id=${currentUser.id}`
          )
          .then((response) => {
            console.log("Successfully left voice channel");
          })
          .catch((err) => {
            console.error("Error leaving channel:", err);
          });
      }
    };
  }, [channelId, currentUser, channel, communityId, navigate]);

  
  const handleUserJoined = (userId, displayName, stream) => {
    
    if (userId === currentUser.id) return;

   
    setParticipants((prev) => {
      const exists = prev.some((p) => p.user_id === userId);
      if (!exists) {
        return [...prev, { user_id: userId, display_name: displayName }];
      }
      return prev;
    });

   
    const peerConnection = new RTCPeerConnection(iceConfig);
    peerConnectionsRef.current[userId] = peerConnection;

   
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    
    peerConnection.ontrack = (event) => {
      logEvent(`Received tracks from ${userId}`);
      const remoteStream = event.streams[0];

      
      if (!audioElementsRef.current[userId]) {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audioElementsRef.current[userId] = audio;
      } else {
        audioElementsRef.current[userId].srcObject = remoteStream;
      }
    };

    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.send(
          JSON.stringify({
            type: "ice_candidate",
            target: userId,
            candidate: event.candidate,
          })
        );
      }
    };

    
    peerConnection.onconnectionstatechange = () => {
      logEvent(
        `Connection state with ${userId}: ${peerConnection.connectionState}`
      );
    };

    peerConnection.oniceconnectionstatechange = () => {
      logEvent(
        `ICE connection state with ${userId}: ${peerConnection.iceConnectionState}`
      );

      
      if (
        peerConnection.iceConnectionState === "disconnected" ||
        peerConnection.iceConnectionState === "failed" ||
        peerConnection.iceConnectionState === "closed"
      ) {
        handleUserLeft(userId);
      }
    };

    
    if (currentUser.id < userId) {
      createAndSendOffer(userId, peerConnection);
    }
  };

  const handleUserLeft = (userId) => {
    
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }

    
    if (audioElementsRef.current[userId]) {
      audioElementsRef.current[userId].srcObject = null;
      delete audioElementsRef.current[userId];
    }

    
    setActiveSpeakers((prev) => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });

    
    setParticipants((prev) => prev.filter((p) => p.user_id !== userId));
  };

  const createAndSendOffer = async (userId, peerConnection) => {
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
      });

      await peerConnection.setLocalDescription(offer);

      socketRef.current.send(
        JSON.stringify({
          type: "offer",
          target: userId,
          offer: offer,
        })
      );
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  const handleOffer = async (fromUserId, offer, stream) => {
    try {
      
      if (!peerConnectionsRef.current[fromUserId]) {
        const peerConnection = new RTCPeerConnection(iceConfig);
        peerConnectionsRef.current[fromUserId] = peerConnection;

        
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

       
        peerConnection.ontrack = (event) => {
          logEvent(`Received tracks from ${fromUserId}`);
          const remoteStream = event.streams[0];

          if (!audioElementsRef.current[fromUserId]) {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.autoplay = true;
            audioElementsRef.current[fromUserId] = audio;
          } else {
            audioElementsRef.current[fromUserId].srcObject = remoteStream;
          }
        };

        
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.send(
              JSON.stringify({
                type: "ice_candidate",
                target: fromUserId,
                candidate: event.candidate,
              })
            );
          }
        };

        
        peerConnection.onconnectionstatechange = () => {
          logEvent(
            `Connection state with ${fromUserId}: ${peerConnection.connectionState}`
          );
        };

        peerConnection.oniceconnectionstatechange = () => {
          logEvent(
            `ICE connection state with ${fromUserId}: ${peerConnection.iceConnectionState}`
          );
        };
      }

      const peerConnection = peerConnectionsRef.current[fromUserId];

    
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

     
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketRef.current.send(
        JSON.stringify({
          type: "answer",
          target: fromUserId,
          answer: answer,
        })
      );
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  };

  const handleAnswer = async (fromUserId, answer) => {
    try {
      const peerConnection = peerConnectionsRef.current[fromUserId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  };

  const handleIceCandidate = async (fromUserId, candidate) => {
    try {
      const peerConnection = peerConnectionsRef.current[fromUserId];
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error("Error handling ICE candidate:", err);
    }
  };

  const handleMuteChange = (userId, isMuted) => {
    
    setParticipants((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, is_muted: isMuted } : p))
    );
  };

  
  const toggleMute = () => {
    if (localStream) {
      
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; 
      });

     
      setIsMuted(!isMuted);

      
      if (socketRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "mute_change",
            is_muted: !isMuted,
          })
        );
      }
    }
  };

  
  const leaveChannel = () => {
    navigate(`/communities/${communityId}`);
  };

  return (
    <div className={styles.voiceChannelContainer}>
      <div className={styles.header}>
        <h2>{channel?.name || "Voice Channel"}</h2>
        <button className={styles.leaveButton} onClick={leaveChannel}>
          <FiX /> Leave Channel
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.participantsContainer}>
          <div className={styles.participantsHeader}>
            <FiUsers /> Participants ({participants.length})
          </div>

          <div className={styles.participantsList}>
            {/* Current user */}
            <div className={styles.participant}>
              <div
                className={`${styles.participantIcon} ${
                  activeSpeakers[currentUser?.id] ? styles.speaking : ""
                }`}
              >
                {activeSpeakers[currentUser?.id] ? <FiVolume2 /> : <FiUser />}
              </div>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>
                  {currentUser?.email || "You"} (You)
                </div>
                {isMuted && (
                  <div className={styles.muteBadge}>
                    <FiMicOff />
                  </div>
                )}
              </div>
            </div>

            {/* Other participants */}
            {participants
              .filter((p) => p.user_id !== currentUser?.id)
              .map((participant) => (
                <div key={participant.user_id} className={styles.participant}>
                  <div
                    className={`${styles.participantIcon} ${
                      activeSpeakers[participant.user_id] ? styles.speaking : ""
                    }`}
                  >
                    {activeSpeakers[participant.user_id] ? (
                      <FiVolume2 />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <div className={styles.participantInfo}>
                    <div className={styles.participantName}>
                      {participant.display_name}
                    </div>
                    {participant.is_muted && (
                      <div className={styles.muteBadge}>
                        <FiMicOff />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.controlButton} ${isMuted ? styles.muted : ""}`}
          onClick={toggleMute}
        >
          {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>

      {/* Debug panel (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className={styles.debugPanel}>
          <h4>Debug Info</h4>
          <div className={styles.debugInfo}>
            <div>
              Connection Status:{" "}
              {socketRef.current?.readyState === 1
                ? "Connected"
                : "Disconnected"}
            </div>
            <div>
              Peer Connections: {Object.keys(peerConnectionsRef.current).length}
            </div>
            <div>Local Stream: {localStream ? "Active" : "Inactive"}</div>
            <div className={styles.debugLog}>
              {debug.map((log, i) => (
                <div key={i} className={styles.debugLogItem}>
                  {log}
                </div>
              ))}
            </div>
            <button onClick={() => setDebug([])} className={styles.clearButton}>
              Clear Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChannel;
