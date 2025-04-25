const { Server } = require("socket.io")
const { createServer } = require("http")
const express = require("express")
const mongoose = require("mongoose")
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const app = express();
dotenv.config()
const multer = require("multer")
const port = 5001
const crypto = require("crypto")
const { GridFSBucket, ObjectId } = require("mongodb")
const { Readable } = require('stream');
const user_schema = require("./profile_schema");
const { request_schema, meetupSchema } = require("./request");
const { json } = require("stream/consumers");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

app.get('/', (req, res) => {
    res.send("hello world")
})
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const MONGODBURI = "mongodb+srv://us1:test1@cluster0.2h4r1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const con = mongoose.createConnection(MONGODBURI)
let gfs;
let img_const = "image-1744212067904-4f1d1126-Figure1.png"
let storage;

let upload;
let user_model;
let request_model;

con.once("open", () => {
    console.log("mongo_connected sussessfully")
    gfs = new GridFSBucket(con.db, { bucketName: "uploads" })
    storage = multer.memoryStorage()
    let upload = multer({ storage: storage })
    user_model = con.model("User", user_schema)
    request_model = con.model("Request", request_schema)
    meetup_model = con.model("Meetup", meetupSchema)

    app.post("/upload_profile/:id", upload.single("myfile"), (req, res, next) => {
        const {id} = req.params
        console.log("upload",id)
        console.log(req.file)
        if (req.file === undefined) {
            console.log("goon")
            return
        }
        const filename = crypto.randomBytes(16).toString("hex") + path.extname(req.file.originalname);

        const readableStream = Readable.from(req.file.buffer);
        const uploadStream = gfs.openUploadStream(filename, {
            contentType: req.file.mimetype,
            metadata: {
                originalname: req.file.originalname,
            }
        });
        const fileId = uploadStream.id;
        console.log(filename)
        uploadStream.on("finish", (fileMetadata) => {
            console.log("here")
            res.status(201).json({
                message: "File uploaded successfully!",
                fileId: fileMetadata?._id || fileId,
                filename: fileMetadata?.filename || filename, // Use filename from metadata
                size: fileMetadata?.length, // Use length from metadata
                contentType: fileMetadata?.contentType, // Use content type from metadata
            });
            readableStream.pipe(uploadStream);
            img_const = filename
            console.log("done")

        });

        console.log(`Piping buffer for ${filename} (ID: ${fileId}) to GridFS...`);
        readableStream.pipe(uploadStream);
        console.log(req.body)
        const prof = JSON.parse(req.body.profile)
        const newUser = {
            name: prof.name || "",
            major: prof.major || "",
            year: prof.year || "",
            bio: prof.bio || "",
            insta_link: prof.no || "", //change
            filename: filename,
            unique_id: id || "",
        }
        console.log("n_use", newUser)
        user_model.replaceOne({ unique_id: id }, newUser, { upsert: true }).then((result, err) => {
            if (err) {
                console.error("Error saving user data:", err);
                return res.status(500).json({ error: "Failed to save user data" });
            }
            console.log("User data saved successfully:", result);
        }
        );
    })

    app.get("/download-text/:unique_id", (req, res) => {
        const uni = req.params.unique_id
        user_model.findOne({ unique_id: uni }).then((user, err) => {
            if (err) {
                console.error("Error finding user:", err);
                return res.status(500).json({ error: "Failed to find user" });
            }
            if (!user) {
                console.log("User not found");
                return res.status(404).json({ error: "User not found" });
            }
            res.json({
                name: user.name,
                major: user.major,
                year: user.year,
                bio: user.bio,
                insta_link: user.insta_link,
            })
            console.log("User found: sending", user);

        })
    })

    app.get("/download/:unique_id", (req, res) => {
        console.log("here", img_const)
        img_const = req.params.unique_id
        user_model.findOne({ unique_id: img_const }).then((user) => {
            if (!user) {
                console.log("User not found");
                return res.status(404).json({ error: "User not found" });
            }
            console.log("User found:", user);
            const downloadstream = gfs.openDownloadStreamByName(user.filename)
            downloadstream.on('data', (chunk) => {
                // Data is being streamed (this log might be verbose)
                // console.log("Streaming data chunk...");
                console.log("starting")
            });
            downloadstream.on('error', (err) => {
                console.error(`Error finding/streaming file err`)
                res.status(405)
            });
            downloadstream.pipe(res)
        }).catch((err) => {
            console.error("Error finding user:", err);
            return res.status(500).json({ error: "Failed to find user" });
        });
    })

    app.post("/upload_request", (req, res, next) => {
        console.log("here")
        console.log(req.body)
        const req1 = req.body
        request_model.findOne({ user_id: req1.id }).then((request) => {
            if (request) {
                const newRequest = {
                    name: req1.name || "",
                    place: req1.place || "",
                    time: req1.time || "",
                    purpose: req1.purpose || "",
                    group_size: req1.group_size || "",
                    location: req1.location || "",
                    interested: [],
                    accepted: [],
                    rejected: [],
                    pending: [],
                    status: "pending",
                    active: true,
                    id: req1.id,
                    req_id: Math.random()
                }
                console.log("n_use", newRequest)
                request.requests.push(newRequest)
                meetup_model.create(newRequest).then((result, err) => {
                    if (err) {
                        console.error("Error saving user data:", err);
                        return res.status(500).json({ error: "Failed to save user data" });
                    }
                    console.log("User data saved successfully:", result);
                }
                )
                request_model.replaceOne({ user_id: req1.id }, request, { upsert: true }).then((result, err) => {
                    if (err) {
                        console.error("Error saving user data:", err);
                        return res.status(500).json({ error: "Failed to save user data" });
                    }
                    console.log("User data saved successfully:", result);
                    console.log(io.sockets.sockets)
                    console.log("emitting new request")
                    io.emit("new_request", newRequest)
                    console.log("new request emitted")
                    console.log("User data saved successfully:", result);
                    setTimeout(() => {
                        console.log("removing request")
                        request_model.findOne({ user_id: req1.id }).then((request) => {
                            if (request) {
                                const updatedRequests = request.requests.map((req) => {
                                    let temp = req
                                    if (req.req_id === newRequest.req_id) {
                                        temp.active = false;
                                        if(req.status === "pending"){
                                        temp.status = "inactive"
                                        }
                                    }
                                    return req
                                });
                                request.requests = updatedRequests;
                                request_model.replaceOne({ user_id: req1.id }, request, { upsert: true }).then((result, err) => {
                                    if (err) {
                                        console.error("Error saving user data:", err);
                                        return res.status(500).json({ error: "Failed to save user data" });
                                    }
                                    console.log("User data saved successfully:", result);
                                    newRequest.active = false
                                    if(req.status === "pending"){
                                    newRequest.status = "inactive"}
                                    meetup_model.replaceOne({ req_id: newRequest.req_id }, newRequest, { upsert: true }).then((result, err) => {
                                        if (err) {
                                            console.error("Error saving user data:", err);
                                            return res.status(500).json({ error: "Failed to save user data" });
                                        }
                                        console.log("User data saved successfully:", result);
                                        io.emit("remove", newRequest.req_id)
                                        for ([id, socket] of io.sockets.sockets) {
                                            if (socket.pid === newRequest.id) {
                                                socket.emit("new_personel", newRequest)
                                                console.log("emitting new personel", newRequest, socket.pid)
                                            }
                                        }
                                    }
                                    )
                                })
                            }
                        })
                    }, 100000)

                })
            }
            else {
                const newRequest = {
                    name: req1.name || "",
                    place: req1.place || "",
                    time: req1.time || "",
                    purpose: req1.purpose || "",
                    group_size: req1.group_size || "",
                    location: req1.location || "",
                    interested: [],
                    accepted: [],
                    rejected: [],
                    pending: [],
                    status: "pending",
                    active: true,
                    id: req1.id,
                    req_id: Math.random()
                }
                console.log("n_use", newRequest)
                const finalreq1 = {
                    user_id: req1.id,
                    requests: [newRequest]
                }
                meetup_model.create(newRequest).then((result, err) => {
                    if (err) {
                        console.error("Error saving user data:", err);
                        return res.status(500).json({ error: "Failed to save user data" });
                    }
                    console.log("User data saved successfully:", result);
                })
                request_model.replaceOne({ user_id: req1.id }, finalreq1, { upsert: true }).then((result, err) => {
                    if (err) {
                        console.error("Error saving user data:", err);
                        return res.status(500).json({ error: "Failed to save user data" });
                    }
                    console.log(io.sockets.sockets)
                    io.emit("new_request", newRequest)
                    console.log("new request emitted")
                    console.log("User data saved successfully:", result);
                    setTimeout(() => {
                        console.log("removing request")
                        request_model.findOne({ user_id: req1.id }).then((request) => {
                            if (request) {
                                const updatedRequests = request.requests.map((req) => {
                                    if (req.req_id === newRequest.req_id) {
                                        req.active = false;
                                        if(req.status === "pending"){
                                            req.status = "inactive"
                                        }
                                    }
                                    return req
                                });
                                request.requests = updatedRequests;

                                request_model.replaceOne({ user_id: req1.id }, request, { upsert: true }).then((result, err) => {
                                    if (err) {
                                        console.error("Error saving user data:", err);
                                        return res.status(500).json({ error: "Failed to save user data" });
                                    }
                                    console.log("User data saved successfully:", result);

                                    newRequest.active = false
                                    newRequest.status = "inactive"
                                    meetup_model.replaceOne({ req_id: newRequest.req_id }, newRequest, { upsert: true }).then((result, err) => {
                                        if (err) {
                                            console.error("Error saving user data:", err);
                                            return res.status(500).json({ error: "Failed to save user data" });
                                        }
                                        console.log("User data saved successfully:", result);
                                        io.emit("remove", newRequest.req_id)
                                        for ([id, socket] of io.sockets.sockets) {
                                            if (socket.pid === newRequest.id) {
                                                socket.emit("new_personel", newRequest)
                                                console.log("emitting new personel", newRequest, socket.pid)
                                            }
                                        }
                                    }
                                    )
                                })
                            }
                        })
                    }, 100000)

                })
            }
        }).
            catch((err) => {
                console.error("Error finding request:", err);
                return res.status(500).json({ error: "Failed to find request" });
            })

    })
    app.get("/accept_request/:unique_id/:reqId", (req, res) => {
        console.log("I have entered accept")
        let { unique_id, reqId } = req.params
        console.log("here accept start", unique_id)
        reqId = parseFloat(reqId)
        console.log("here", unique_id, reqId)
        meetup_model.findOne({ active: true, req_id: reqId }).then((request) => {
            if (!request) {
                console.log("Request not found");
                return res.status(404).json({ error: "Request not found" });
            }
            console.log("Request found:", request);
            const updatedRequest = {
                ...request._doc,
                pending: [...request.pending.filter((id) => id !== unique_id), unique_id]
            };
            request_model.findOne({ user_id: request.id }).then((user_request) => {
                if (!user_request) {
                    console.log("User request not found");
                    return res.status(404).json({ error: "User request not found" });
                }
                const updatedRequests = user_request.requests.map((req) => {
                    console.log("req", req.req_id, reqId)
                    if (req.req_id === reqId) {
                        console.log("here")
                        return updatedRequest
                    }
                    return req
                })
                user_request.requests = updatedRequests;
                request_model.replaceOne({ user_id: request.id }, user_request, { upsert: true }).then((result, err) => {
                    if (err) {
                        console.error("Error saving user data:", err);
                        return res.status(500).json({ error: "Failed to save user data" });
                    }
                    console.log("User data saved successfully:", result);
                    console.log(user_request.requests)
                    for ([id, socket] of io.sockets.sockets) {
                        if (socket.pid === updatedRequest.id) {
                            socket.emit("accept_request", { id: unique_id, reqId: reqId, req: updatedRequest })
                            console.log("emitting accept request")
                            console.log("socket id", socket.pid)
                        }
                        if (socket.pid === unique_id) {
                            console.log(socket.pid, updatedRequest.id, unique_id, "check_final")
                            socket.emit("pending1", {updatedRequest})
                        }

                    }
                    meetup_model.replaceOne({ req_id: reqId }, updatedRequest, { upsert: true }).then((result, err) => {
                        if (err) {
                            console.error("Error saving user data:", err);
                            return res.status(500).json({ error: "Failed to save user data" });
                        }
                        console.log("User data saved successfully:", result);
                        res.status(200).send()
                        request_model.findOne({ user_id: unique_id }).then((request) => {
                            if (!request) {
                                const req = new request_model({
                                    user_id: unique_id,
                                    requests: [],
                                    pending: [reqId],
                                    accepted: [],
                                })
                                req.save().then((result, err) => {
                                    if (err) {
                                        console.error("Error saving user data:", err);
                                        return res.status(500).json({ error: "Failed to save user data" });
                                    }
                                    console.log("User data saved successfully (accept_reciever):", result);
                                    res.status(200).send()
                                })
                            }
                            else {
                                console.log("User data saved successfully:", result);
                                    request.pending = [...request.pending.filter((id) => id !== reqId), reqId]
                                    request_model.replaceOne({ user_id: unique_id }, request, { upsert: true }).then((result, err) => {
                                        if (err) {
                                            console.error("Error saving user data:", err);
                                            return res.status(500).json({ error: "Failed to save user data" });
                                        }
                                        console.log("User data saved successfully: (accept_reciever)", result);
                                        res.status(200).send()
                                    })
                                
                            }
                        })
                    }
                    );
                });
            })

        })
    })

    app.get("/approved/:unique_id/:reqId", (req, res) => {
        const { unique_id } = req.params
        let reqId = parseFloat(req.params.reqId)
        console.log("here", unique_id, reqId)
        meetup_model.findOne({ active: true, req_id: reqId }).then((request) => {
            if (!request) {
                console.log("Request not found");
                return res.status(404).json({ error: "Request not found" });
            }
            console.log("Request found:", request);
            const updatedRequest = {
                ...request._doc,
                accepted: [...request.accepted.filter((id) => id !== unique_id), unique_id],
                pending: [...request.pending.filter((id) => id !== unique_id)],
                status: "accepted",
                active: false
            };
            console.log("updateing")
            request_model.findOne({ user_id: request.id }).then((user_request) => {
                if (!user_request) {
                    console.log("User request not found");
                    return res.status(404).json({ error: "User request not found" });
                }
                const updatedRequests = user_request.requests.map((req) => {
                    if (req.req_id === reqId) {
                        console.log("here",updatedRequest)
                        return updatedRequest
                    }
                    return req
                })
                user_request.requests = updatedRequests;
                user_request.accepted = [...user_request.accepted.filter((id) => id !== reqId), reqId]
                user_request.pending = [...user_request.pending.filter((id) => id !== reqId)]
                console.log("user_request", user_request.requests)
                request_model.replaceOne({ user_id: request.id }, user_request, { upsert: true }).then((result, err) => {
                    if (err) {
                        console.error("Error saving user data:", err);
                        return res.status(500).json({ error: "Failed to save user data" });
                    }
                    console.log("User data saved successfully:", result);
                    io.emit("remove", reqId)
                    console.log("emitting remove")
                    for ([id, socket] of io.sockets.sockets) {
                        if (socket.pid === unique_id) {
                            console.log(socket.pid)
                            socket.emit("pending1r", {reqId: reqId})
                            socket.emit("upcoming1", updatedRequest)
                            socket.emit("new_personel", updatedRequest)
                            console.log("emitting approved")
                            console.log("socket id", socket.pid)
                        }
                        console.log("socket id", socket.pid,updatedRequest.id)
                        if (socket.pid === updatedRequest.id) {
                            console.log(socket.pid)
                            socket.emit("accept_requestrm", {reqId: reqId})
                            socket.emit("upcoming1", updatedRequest)
                            socket.emit("new_personel", updatedRequest)
                            console.log("emitting accept request")
                            console.log("socket id", socket.pid)
                        }
                    }
                    console.log("here", updatedRequest)
                    meetup_model.replaceOne({ req_id: reqId }, updatedRequest, { upsert: true }).then((result, err) => {
                        
                        if (err) {
                            console.error("Error saving user data:", err);
                            return res.status(500).json({ error: "Failed to save user data" });
                        }
                        request_model.findOne({ user_id: unique_id }).then((request) => {
                        if(!request){
                            const req = new request_model({
                                user_id: unique_id,
                                requests: [],
                                pending: [],
                                accepted: [reqId],
                            })
                            req.save().then((result, err) => {
                                if (err) {
                                    console.error("Error saving user data:", err);
                                    return res.status(500).json({ error: "Failed to save user data" });
                                }
                                console.log("User data saved successfully (accept_reciever):", result);
                                res.status(200).send()
                            })
                        }
                        else{
                        console.log("User data saved successfully:", result);
                        request_model.findOne({ user_id: unique_id }).then((request) => {
                            request.accepted = [...request.accepted.filter((id) => id !== reqId), reqId]
                            request.pending = [...request.pending.filter((id) => id !== reqId)]
                            request_model.replaceOne({ user_id: unique_id }, request, { upsert: true }).then((result, err) => {
                                if (err) {
                                    console.error("Error saving user data:", err);
                                    return res.status(500).json({ error: "Failed to save user data" });
                                }
                                console.log("User data saved successfully: (accept_reciever)", result);
                                res.status(200).send()
                            })


                        })
                    }})}
                    );
                });
            })
        })
    })

    app.get("/request/:reqId", (req, res) => {
        const { reqId } = req.params
        console.log("me_here_comon")
        console.log("here", reqId)
        meetup_model.findOne({ active: true, req_id: reqId }).then((request) => {
            if (!request) {
                console.log("Request not found");
                return res.status(405).json({ error: "Request not found" });
            }
            console.log("Request found:", request);
            res.json(request)
        }
        ).catch((err) => {
            console.error("Error finding request:", err);
            return res.status(500).json({ error: "Failed to find request" });
        })
    })

    httpServer.listen(port, () => {
        console.log(`listening on ${port}`)
    })

})

io.on("connection", (socket) => {
    console.log("new connection")
    if (socket.handshake.auth.token) {
        console.log("token", socket.handshake.auth.token)
        socket.pid = socket.handshake.auth.token
        console.log("socket id", socket.pid)
    }
    socket.on("personel_requests", (data) => {
        console.log("personnel requests")
        request_model.findOne({ user_id: data.id }).then((request) => {
            if (request) {
                console.log("sending requests")
                const batch1 = request.requests
                const ids = request.accepted
                meetup_model.find({ req_id: { $in: ids } }).then((requests) => {
                    if (!requests) {
                        console.log("no accepted request")
                        socket.emit("personel_requests", batch1)
                    }
                    else{
                        const batch2 = requests.filter((request) => {
                            return !batch1.some((req) => req.req_id === request.req_id)
                        })
                        const final_batch = [...batch1, ...batch2]
                        socket.emit("personel_requests", final_batch)
                    }
                })
            }
            else {
                socket.emit("personel_requests", [])
            }
        })
    })

    socket.on("my_requests", (data) => {
        console.log("my requests")
        meetup_model.find({}).then((requests) => {
            console.log("sending requests")
            socket.emit("my_requests", requests.filter((request) => {
                return request.active === true
            }))
            console.log("sent")
        })
    })

    socket.on("pending_requests", (data) => {
        console.log("enter pending endpoint")
        request_model.findOne({ user_id: data.id }).then((request) => {
            if(!request){
                console.log("request not found")
                socket.emit("pending_requests", [])
                return
            }
            console.log("sending requests", request.requests)
            let tempr = request.requests.filter((req) => {
                return req.active === true && req.pending.length > 0
            })
            let ret = []
            for (let i = 0; i < tempr.length; i++) {
                for(let j = 0; j < tempr[i].pending.length; j++){
                    ret.push({req: tempr[i], id: tempr[i].pending[j]})
                }
            }
            socket.emit("pending_requests", ret)
            console.log("sent")
        })
    })

    socket.on("upcoming_requests", (data) => {
        console.log("enter upcoming endpoint")
        request_model.findOne({ user_id: data.id }).then((request) => {
            if(!request){
                console.log("request not found")
                socket.emit("upcoming_requests", [])
                return
            }
            let temp2 = request.accepted
            meetup_model.find({req_id : {$in: temp2}}).then((requests2) => {
                if(!requests2){
                    console.log("request not found")
                    socket.emit("upcoming_requests", [])
                    return
                }
                console.log("sending requests")
                socket.emit("upcoming_requests",requests2)
            })
        })
    })

    socket.on("pendingss", (data) => {
        console.log("enter pending endpoint")
        request_model.findOne({ user_id: data.id }).then((request) => {
            if (request) {
                let temprr = request.pending
                console.log(request.pending)
                meetup_model.find({ req_id: { $in: temprr } }).then((requests) => {
                    if (!requests) {
                        console.log("request not found")
                        socket.emit("pendingss", [])
                        return
                    }
                    console.log("sending requests")
                    console.log("temps",temprr)
                    console.log("reqs",requests)
                    console.log("sending requests")
                    requests = requests.filter((request) => {
                        return request.active === true
                    }
                    )
                    socket.emit("pendingss", requests)
                })
                console.log("sent") 
            }
            else {
                console.log("request not found")
                console.log("sending requests")
                socket.emit("pendingss", [])
            }
        })
    }
    )

    socket.on("disconnect", () => {
        console.log("disconnected")
    })
})


