import react, { useState, useEffect, useContext, useCallback, useRef, createContext } from "react";
import io from 'socket.io-client';
import { createClient } from '@supabase/supabase-js';
const websocketContext = createContext(null);
export const useWebsocket = () => {
    if (useContext(websocketContext) === null) {
        throw new Error('useWebsocket must be used within a WebsocketProvider');
    }
    const context = useContext(websocketContext);
    return context
}

export const WebsocketProvider = ({ children }) => {
    const [connected, set_connected] = useState(false);
    const [my_requests, set_requets] = useState([]);
    const [personel_requests, set_personel_requests] = useState([]);
    const [accept_request, set_accept_requests] = useState([]);
    const [interacted_state, setinteracted] = useState([]);
    const [upcoming, set_upcoming] = useState([]);
    const interacted = useRef([]);
    const [id, set_id] = useState(null);
    const [notifyup, setnotifyup] = useState(false)
    const [notifyacc, setnotifyacc] = useState(false)
    const [notifyrec, setnotifyrec] = useState(false)
    const socketref = useRef(null);
    useEffect(() => {
        console.log("websocket provider mounted")
        const supabaseUrl = "https://iivokjculnflryxztfgf.supabase.co";
        const supabaseKey =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpdm9ramN1bG5mbHJ5eHp0ZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NzExOTAsImV4cCI6MjA1NDU0NzE5MH0.8rBAN4tZP8S0j1wkfj8SwSN1Opdf9LOERb-T47rZRYk";
        const supabase = createClient(supabaseUrl, supabaseKey);
        let email = null;
        const func = async () => {
            try {
                console.log("fetching user");
                const { data: { user },
                    error: userError, } = await supabase.auth.getUser();
                console.log("user_fetched", user, userError);
                if (userError) {
                    console.error("Error fetching user:", userError);
                    console.log("this_problem_why",)
                    alert("Error fetching user. Please try again later.");
                    throw userError;
                    return null;
                }
                if (user) {
                    console.log("user", user);
                    set_id(user.email);
                    email = user.email;
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                console.log("outer_block_network")
                alert(`Error fetching. Please try again later. ${error}`);
                throw error;
                return null;
            }
            console.log("email", email);
            console.log("done")
            socketref.current = io("http://localhost:5001", {
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket'],
                auth: {
                    token: email
                }
            });
            socketref.current.on("connect", () => {
                console.log("connected");
                set_connected(true);
            });
            socketref.current.on("disconnect", () => {
                console.log("disconnected");
                set_connected(false);
            });
            socketref.current.on("new_request", (req) => {
                console.log("new request received:", req);
                if (true) {
                    console.log("request id matched");
                    set_requets((old_requests) => {
                        return [...old_requests, req]
                    });
                    setnotifyrec(true)
                }
            });
            socketref.current.on("my_requests", (data) => {
                console.log("my requests data received:", data);
                let n_inter = interacted.current

                set_requets(() => {
                    console.log("old_requests", n_inter);
                    let temp = data.filter((request) => !n_inter.includes(request.req_id))
                    console.log("temp", temp);
                    return temp
                })
                setnotifyrec(true)
                return n_inter
            });

            socketref.current.on("personel_requests", (data) => {
                console.log("personel requests data received:", data);
                set_personel_requests(data)
            })

            socketref.current.on("new_personel", (data) => {
                console.log("new personel request received:", data);
                set_personel_requests((old_requests) => {
                    return [...old_requests, data]
                });
            })

            socketref.current.on("remove", (id) => {
                console.log("remove request with id:", id);
                set_requets((old_requests) => {
                    let temp = old_requests.filter((request) => {
                        console.log(request.req_id, id)
                        return request.req_id !== id
                    });
                    console.log("temp", temp)
                    return temp
                });

            })
            socketref.current.on("accept_request", (data) => {
                const { id, req_id, req } = data;
                set_accept_requests((old_requests) => {
                    return [...old_requests, { req: req, id: id }]
                });
                setnotifyacc(true)
            })

            socketref.current.on("pending_requests", (data) => {
                console.log("pending requests data received:", data);
                set_accept_requests(data)
                setnotifyacc(true)
            })

            socketref.current.on("accept_requestrm", (data) => {
                console.log("accept request data received:", data);
                set_accept_requests((old_requests) => {
                    let temp = old_requests.filter((request) => {
                        return request.req.req_id !== data.reqId
                    })
                    if (!temp) {
                        return []
                    }
                    console.log("temp", temp)
                    return temp
                })
            })

            socketref.current.on("upcoming_requests", (data) => {
                console.log("upcoming requests data received:", data);
                set_upcoming(data)
                setnotifyup(true)
            }
            )

            socketref.current.on("upcoming1", (data) => {
                console.log("upcoming1 requests data received:", data);
                set_upcoming((old_requests) => {
                    return [...old_requests, data]
                });
                setnotifyup(true)
            })
            socketref.current.on("pending1", (data) => {
                console.log("pending1 requests data received:", data);
                setinteracted((old_requests) => {
                    return [...old_requests, data.updatedRequest]
                });
            })
            socketref.current.on("pendingss", (data) => {
                console.log("pendingss requests data received:", data);
                setinteracted(data)
            }
            )
            socketref.current.on("pending1r", (data) => {
                console.log("pendings1r requests data received:", data);
                setinteracted((old_requests) => {
                    return old_requests.filter((request) => {
                        return request.req_id !== data.reqId
                    }
                    )
                });
            });
        }
        func();


        return () => {
            socketref.current.disconnect();
            socketref.current.off("connect");
            socketref.current.off("disconnect");
            socketref.current.off("my_requests");
            socketref.current.off("new_request");
            socketref.current.off("remove");
            socketref.current.off("accept_request");
            socketref.current.off("personel_requests");
            socketref.current.off("new_personel");
            socketref.current.off("pending_requests");
            socketref.current.off("accept_requestrm");
            socketref.current.off("upcoming_requests");
            socketref.current.off("upcoming1");
            socketref.current.off("pending1");
            socketref.current.off("pendingss");
            socketref.current = null;
            console.log("Socket disconnected");
        };
    }, [])
    const requestRequests = useCallback((userid) => {
        if (socketref.current.connected === false) {
            console.error("Socket not initialized");
            return;
        }
        socketref.current.emit("my_requests", { id: userid });
    }, []);

    const removeRequest = useCallback((req_id) => {
        interacted.current.push(req_id);

        set_requets((datas) => {
            let temp = datas.filter((request) => !interacted.current.includes(request.req_id))
            console.log("temp", temp);
            return temp
        })

        fetch(`http://localhost:5001/request/${req_id}`).then((response) => {
            console.log("response", response)
            if (response.ok) {
                return response.json();
            }
            else {
                console.error("Error fetching request:", response.statusText);
                throw new Error("Request fetch failed");
            }
        }).then((data) => {
            console.log("data", data)
            setinteracted((old_requests) => {
                return [...old_requests.filter((request) => data.req_id !== request.req_id), data]
            });
            console.log("interacted", interacted.current)
        }).catch((error) => {
            console.error("Error fetching request:", error);
            alert("Error fetching request. Please try again later.");
        }
        );
        console.log("interacted", interacted.current)
    }, []);
    const reqPersonnel = useCallback((userid) => {
        if (socketref.current.connected === false) {
            console.error("Socket not initialized");
            return;
        }
        console.log("requesting personel requests", userid);
        socketref.current.emit("personel_requests", { id: userid });
    }
        , []);

    const reqpending = useCallback((userid) => {
        if (socketref.current.connected === false) {
            console.error("Socket not initialized");
            return;
        }
        console.log("requesting pending requests", userid);
        socketref.current.emit("pending_requests", { id: userid });
    }
        , []);
    const upcoming_requests = useCallback((userid) => {
        if (socketref.current.connected === false) {
            console.error("Socket not initialized");
            return;
        }
        console.log("requesting upcoming requests", userid);
        socketref.current.emit("upcoming_requests", { id: userid });
    }
        , []);

    const reqaccept = useCallback((userid) => {
        if (socketref.current.connected === false) {
            console.error("Socket not initialized");
            return;
        }
        console.log("requesting accept requests", userid);
        socketref.current.emit("pendingss", { id: userid });
    }, [])
    const contextValue = {
        connected,
        my_requests,
        requestRequests,
        removeRequest,
        reqPersonnel,
        accept_request,
        interacted_state,
        personel_requests,
        reqpending,
        upcoming_requests,
        upcoming,
        reqaccept,
        id,
        notifyacc,
        notifyrec,
        notifyup,
        setnotifyacc,
        setnotifyrec,
        setnotifyup
    };
    return (
        <websocketContext.Provider value={contextValue}>
            {children}
        </websocketContext.Provider>
    );
}
