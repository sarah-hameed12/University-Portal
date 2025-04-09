// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const { randomBytes } = require("crypto");
// const bcrypt = require("bcrypt");
// const multer = require("multer");
// const { GridFsStorage } = require("multer-gridfs-storage");
// database_uri = "mongodb+srv://us1:test1@cluster0.2h4r1.mongodb.net/"


// const httpserver = createServer()
// const mong = require("mongoose");

// const conndb = async () => {
//     try {
//         await mong.connect(database_uri).then(() => console.log("success"))
//     }
//     catch (error) {
//         console.error(error)
//     }
// }
// conndb()
// const io = new Server(httpserver, {
//     cors: { origin: "*" }

// })

// const gen_token = () => {
//     return randomBytes(16).toString("hex")
// }

// var users = {}
// var unique_ids = {}
// var un = 0
// var mod;

// async function get_hash(pwd, salts) {
//     const salt = "$2b$10$abcdefghijklmnopqrstuv";
//     return await bcrypt.hash(pwd, salt)
// }

// async function check_sender(name, token1) {
//     return await mod.findOne({
//         token: token1,
//         "message_record.sender": name
//     })
// }

// io.on("connect", async socket => {
//     //////console.log("connecting", socket.handshake.query.token, socket.handshake.query.name)
//     var token = socket.handshake.query.token
//     var ch = true
//     //////console.log(token)
//     //////console.log(socket.handshake.query.pwd)
//     if (socket.handshake.query.token == "" && socket.handshake.query.name == "") {
//         ////console.log("here")
//         var tok = gen_token()
//         users[tok] = "guest"
//         socket.token = tok
//         ////console.log(socket.token)
//         socket.emit("token", {token:tok, name: ""})
//         ch = false
//     }

//     socket.on("message", async data => {
//         //console.log(data)
//         if (data.to === "server") {
//             //console.log('here22')

//             const users_data = await mod.find({})
//             for (let i = 0; i < users_data.length; i++) {
//                 ////console.log(users[key])
//                 if (users_data[i].username != "guest") {
//                     ////console.log(socket.name)
//                     var ch1 = await check_sender("server", users_data[i].token)
//                     //console.log("ch1:", ch1)
//                     if (ch1) {
//                         //console.log(users_data[i].token)
//                         let update = await mod.findOneAndUpdate(
//                             { token: users_data[i].token, "message_record.sender": "server" }, // Find the correct user with "server" as sender
//                             {
//                                 $push: {
//                                     "message_record.$[elem].messages": { message: `${socket.name}: ${data.msg}` }
//                                 }
//                             },
//                             { arrayFilters: [{ "elem.sender": "server" }] } // Apply filter to modify the correct object inside "message_record"
//                         );

//                     }
//                     else if (users_data[i].token != "") {
//                         ////console.log("data", 2)
//                         let update = await mod.findOneAndUpdate(
//                             { token: users_data[i].token },
//                             { $push: { message_record: { messages: [{ message: `${socket.name}: ${data.msg}`, timestamp: Date.now() }], sender: "server" } } }
//                         )
//                     }
//                 }
//             }
//             //console.log(data.msg)
//             io.emit("message", {msg:`${socket.name}: ${data.msg}`, server: true})
//         }

//         else {
//             var room_name
//             if (socket.name > data.to)
//             {
//             room_name = socket.name + data.to
//             }
//             else {
//             room_name = data.to + socket.name
//             }
//             const room_check = io.sockets.adapter.rooms.has(room_name);
//             const recievers = [socket.name, data.to]
//             //console.log(room_check)
//             if (true) {
//                 //console.log("here")
//                 const sockss = io.sockets.sockets
//                 ////console.log(sockss)

//                 for (let key of sockss.keys()) {
//                     //console.log("loop_enter")
//                     //console.log(sockss.get(key).name)
//                     //console.log(recievers)
//                     //console.log((recievers.includes(sockss.get(key).name || "")))

//                     if ((recievers.includes(sockss.get(key).name || ""))) {
//                         //console.log(`${socket.name} joining`)
//                         sockss.get(key).join(room_name)
//                     }
//                 }
//             }
//             const clientdata = await mod.find({})
//             for (let i = 0; i < clientdata.length; i++) {
//                 ////console.log(users[key])
//                 if (recievers.includes(clientdata[i].username)) {
//                     //console.log(socket.name)
//                     var ch1 = await check_sender(room_name, clientdata[i].token)
//                     ////console.log("ch1:", ch1)
//                     if (ch1) {
//                         ////console.log(data, "1")
//                         let update = await mod.findOneAndUpdate(
//                             { token: clientdata[i].token, "message_record.sender": room_name }, // Find the correct user with "server" as sender
//                             {
//                                 $push: {
//                                     "message_record.$[elem].messages": { message: `${socket.name}: ${data.msg}` }
//                                 }
//                             },
//                             { arrayFilters: [{ "elem.sender": room_name }] } // Apply filter to modify the correct object inside "message_record"
//                         );

//                     }
//                     else if (clientdata[i].username != "") {
//                         ////console.log("data", 2)
//                         let update = await mod.findOneAndUpdate(
//                             { token: clientdata[i].token },
//                             { $push: { message_record: { messages: [{ message: `${socket.name}: ${data.msg}`, timestamp: Date.now() }], sender: room_name } } }
//                         )
//                     }
//                 }
//             }
//             io.to(room_name).emit("message",  {msg:`${socket.name}: ${data.msg}`, server: false})


//         }
//     }
//     )

//     socket.on("list", () => {
//         var mes = "\n"
//         for (const key of Object.keys(unique_ids)) {
//             //////console.log(key)
//             //////console.log("sock",socket.token, unique_ids[key])
//             //////console.log(unique_ids[key])
//             ////console.log(unique_ids, users[unique_ids[key]])
//             if (socket.token != unique_ids[key] && users[unique_ids[key]] != "") {
//                 //////console.log("sock",socket.token, unique_ids[key])
//                 // ////console.log(users[unique_ids[key]])
//                 mes = mes + "Server: username: " + users[unique_ids[key]] + " key: " + key + "<br>"
//             }
//         }
//         if (mes == "\n") {
//             mes = mes + "server: no user other than you.\n"
//         }
//         io.to(socket.id).emit("message", mes)
//     })
//     socket.on("pretext", async data => {
//         ////console.log("pre")
//         if (data.to != "server")
//         {
//         if (socket.name > data.to){
//             data.to = socket.name + data.to
//         }
//         else{
//             data.to = data.to + socket.name
//         }
//     }
//         var ret = []
//         //console.log(data.to)
//         var checker = await check_sender(data.to, socket.token)
//         //console.log(`checker ${checker}`)
//         if (checker)
//         {
//         //console.log(data.to)
//         var check2 = await mod.findOne({ token: socket.token})
//         //console.log(check2)
//         for (let i = 0; i < check2.message_record.length; i++) {
//             if (check2.message_record[i].sender == data.to)
//             {
//             for (let j = 0; j < check2.message_record[i].messages.length; j++) {
//                 let mess = check2.message_record[i].messages[j]
//                 ////console.log(mess.message)
//                 ret = [...ret, mess.message]
//                 //socket.emit("message", mess.message)

//             }
//         }
//         }
//     }
//     //await sleep(2000)
//     socket.emit("load_message", ret)
//     if (data.to === "server")
//     {
//         var docs = await mod.find({})
//         //console.log(docs.length)
//         for (let i = 0; i < docs.length; i++) {
//             //console.log(docs[i].username)
//             socket.emit("user", docs[i].username)
//         }
//     }
//     })

//     socket.on("con", async data => {
//         var u_name = data.nam
//         var pwd = data.password
//         ////console.log(u_name)
//         ////console.log(pwd)
//         ////console.log(socket.token)
//         ////console.log("enter")        
//         users[socket.token] = u_name

//         var hpwd = await get_hash(pwd, 1)
//         var check1 = await mod.findOne({ username: u_name, password: hpwd })
//         if (check1) {
//             ////console.log("tok: " ,socket.token)
//             var temp1 = await mod.findOneAndUpdate(
//                 { username: u_name, password: hpwd },
//                 { $set: { token: socket.token } }
//             );

//         }
//         else {
//             ////console.log("enter2")
//             let nuser = new mod({
//                 username: u_name || "guest",
//                 password: hpwd,
//                 token: socket.token
//             })
//             await nuser.save()
//         }
//         socket.name = data.nam
//         //console.log("commit")
//         socket.emit("token", {token: socket.token, name: socket.name})
//         socket.emit("done", "aa")
//         io.emit("user", socket.name)
//     })
// }
// )
// let gfs
// mong.connection.once("open", () => {
//     ////console.log("connected");
//     mod = require("./model_client")
    


//     httpserver.listen(3800, () => { console.log("listening 3800") })
// })
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ========================================================
//                      IMPORTS
// ========================================================
const { createServer } = require("http");
const { Server } = require("socket.io");
const { randomBytes } = require("crypto");
const bcrypt = require("bcrypt");
const mong = require("mongoose");
const express = require("express");
const multer = require("multer"); // Using multer for parsing, but not GridFsStorage lib
const { GridFSBucket, ObjectId } = require("mongodb");
const cors = require('cors');
const { Readable } = require('stream'); // Needed for manual stream piping

// ========================================================
//                    CONFIGURATION
// ========================================================
// !! Consider using environment variables for sensitive data !!
const database_uri = "mongodb+srv://us1:test1@cluster0.2h4r1.mongodb.net/"; // Replace if needed
const PORT = process.env.PORT || 3800;
const SALT_ROUNDS = 10; // For bcrypt hashing
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit for uploads
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const GRIDFS_BUCKET_NAME = "uploads"; // MongoDB collection prefix for uploads

// ========================================================
//                  APP & SERVER SETUP
// ========================================================
const app = express();
app.use(cors({ origin: "*" })); // Allow all origins for simplicity (adjust for production)
const httpserver = createServer(app);
const io = new Server(httpserver, {
    cors: { origin: "*" }
});

// ========================================================
//        PLACEHOLDERS (INITIALIZED AFTER DB CONNECT)
// ========================================================
let db;     // Native MongoDB driver DB instance
let gfs;    // GridFSBucket instance
let mod;    // Mongoose model for 'client'
let upload; // Multer upload middleware instance (using memory storage)

// ========================================================
//                    HELPER FUNCTIONS
// ========================================================
const gen_token = () => randomBytes(16).toString("hex");

/**
 * Hashes a password securely using bcrypt.
 */
async function get_hash(pwd) {
    console.log("[Helper] Hashing password...");
    const hash = await bcrypt.hash(pwd, SALT_ROUNDS);
    console.log("[Helper] Password hashed.");
    return hash;
}

/**
 * Checks if a message record exists for a specific sender identifier within a user's document.
 */
async function check_sender_record_exists(token1, senderIdentifier) {
    if (!mod) { console.error("[Helper Check Sender] Model not loaded!"); return false; }
    const user = await mod.findOne({ token: token1, "message_record.sender": senderIdentifier }, { _id: 1 }).lean();
    return !!user;
}


// ========================================================
//              DATABASE & MIDDLEWARE INITIALIZATION
// ========================================================
/**
 * Connects to MongoDB, initializes GridFS, loads the Mongoose model,
 * and sets up the Multer middleware (using memory storage).
 */
const conndb = async () => {
    try {
        console.log(`[Init] Connecting to MongoDB...`);
        const conn = await mong.connect(database_uri);
        console.log("[Init] MongoDB connected successfully.");
        db = conn.connection.db;

        if (!db || typeof db.collection !== 'function') throw new Error("Failed to get valid native DB driver instance.");
        console.log("[Init DEBUG] 'db' object obtained successfully.");

        gfs = new GridFSBucket(db, { bucketName: GRIDFS_BUCKET_NAME });
        console.log(`[Init] GridFSBucket initialized (bucket: ${GRIDFS_BUCKET_NAME}).`);

        mod = require("./model_client"); // Ensure this path points to your schema file
        if (!mod || typeof mod.findOne !== 'function') throw new Error("Failed to load Mongoose model or model is invalid.");
        console.log("[Init] Client Mongoose model loaded successfully.");

        // --- Initialize Multer with Memory Storage ---
        console.log("[Init DEBUG] Initializing Multer with MemoryStorage...");
        const storage = multer.memoryStorage();
        upload = multer({
            storage: storage,
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (req, file, cb) => {
                if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    console.log(`[Multer Filter] Allowing file: ${file.originalname} (${file.mimetype})`);
                    cb(null, true);
                } else {
                    console.warn(`[Multer Filter] Rejecting file: ${file.originalname} (${file.mimetype})`);
                    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}.`));
                }
            }
        });
        console.log(`[Init] Multer (MemoryStorage) middleware initialized (limit: ${MAX_FILE_SIZE / 1024 / 1024}MB).`);

    } catch (error) {
        console.error("[Init CRITICAL] Initialization error in conndb function:", error);
        process.exit(1); // Exit if core initialization fails
    }
};


// ========================================================
//                  SOCKET.IO EVENT HANDLING
// ========================================================
io.on("connect", socket => {
    console.log(`[Socket Connect] ID: ${socket.id}, Transport: ${socket.conn.transport.name}`);

    // --- Initial Authentication / Guest Handling ---
    (async () => {
        let token = socket.handshake.query.token;
        console.log(`[Socket ${socket.id}] Handshake query:`, { token: token ? token.substring(0,5)+'...' : 'null', name: socket.handshake.query.name });
        try {
            if (!mod) await new Promise(resolve => setTimeout(resolve, 150)); // Short delay for safety
            if (!mod) { throw new Error("Model 'mod' not available during connect handler!"); }

            if (token && token !== "a" && token.length > 10) {
                console.log(`[Socket ${socket.id}] Attempting auth with provided token.`);
                const user = await mod.findOne({ token: token }).lean();
                if (user) {
                    socket.token = token;
                    socket.name = user.username;
                    console.log(`[Socket ${socket.id}] User '${socket.name}' re-authenticated via token.`);
                    socket.emit("token", { token: socket.token, name: socket.name });
                } else { /* Invalid token */ console.warn(`[Socket ${socket.id}] Invalid token provided. Treating as guest.`); token = gen_token(); socket.token = token; socket.name = null; socket.emit("token", { token: socket.token, name: "" }); }
            } else { /* No valid token */ console.log(`[Socket ${socket.id}] No valid token provided. Treating as new guest.`); token = gen_token(); socket.token = token; socket.name = null; socket.emit("token", { token: socket.token, name: "" }); }
        } catch (err) { console.error(`[Socket ${socket.id}] Error during initial auth sequence:`, err); socket.emit("auth_failed", { message: "Server authentication error." }); socket.disconnect(true); }
    })(); // End of async IIFE

    // --- Sign-in / Sign-up Handler ---
    socket.on("con", async (data) => {
        console.log(`[Socket ${socket.id}][con] Received. Auth: ${socket.name || 'Guest'}. Data:`, { nam: data.nam, pwd: '***' });
        if (!mod) { console.error(`[Socket ${socket.id}][con] Model not ready!`); socket.emit("login_error", { message:"Server not ready"}); return; }
        if (socket.name) { console.warn(`[Socket ${socket.id}][con] Already logged in as ${socket.name}. Ignoring.`); socket.emit("token", { token: socket.token, name: socket.name }); return; }
        if (!socket.token) { console.error(`[Socket ${socket.id}][con] Socket has no token. Disconnecting.`); socket.emit("login_error", { message:"Connection error"}); socket.disconnect(true); return; }

        const u_name = data.nam; const pwd = data.password;
        if (!u_name || !pwd) { socket.emit("login_error", { message: "Username and password required." }); return; }

        try {
            let user = await mod.findOne({ username: u_name });
            if (user) { // User exists -> Check password
                console.log(`[Socket ${socket.id}][con] User '${u_name}' found. Comparing password.`);
                const match = await bcrypt.compare(pwd, user.password);
                if (match) { // Password OK -> Login
                    user.token = socket.token; await user.save(); socket.name = user.username;
                    console.log(`[Socket ${socket.id}][con] User '${socket.name}' logged IN.`);
                    socket.emit("token", { token: socket.token, name: socket.name }); socket.emit("done", "Login successful"); io.emit("user", socket.name);
                } else { /* Wrong password */ console.log(`[Socket ${socket.id}][con] Login failed for '${u_name}': Incorrect password.`); socket.emit("login_error", { message: "Invalid username or password" }); }
            } else { // User not found -> Create
                 console.log(`[Socket ${socket.id}][con] User '${u_name}' not found. Creating.`);
                 const hpwd = await get_hash(pwd);
                 const newUser = new mod({ username: u_name, password: hpwd, token: socket.token, message_record: [] });
                 await newUser.save(); socket.name = newUser.username;
                 console.log(`[Socket ${socket.id}][con] New user '${socket.name}' created and logged IN.`);
                 socket.emit("token", { token: socket.token, name: socket.name }); socket.emit("done", "Account created successfully"); io.emit("user", socket.name);
            }
        } catch (err) { console.error(`[Socket ${socket.id}][con] Error:`, err); socket.emit("login_error", { message: "Server error during authentication." }); }
    });

    // --- Message Handler ---
    socket.on("message", async (data) => {
        // --- Validation ---
        if (!mod) { console.error(`[Socket ${socket.id}][message] Model not ready.`); return; }
        if (!socket.name) { console.warn(`[Socket ${socket.id}][message] Ignored: Unauthenticated socket.`); socket.emit("error", { message: "Please log in to send messages."}); return; }
        if (!data || (!data.msg?.trim() && !data.imageFileId)) { console.warn(`[Socket ${socket.id}][message] Ignored: Empty message content.`); return; }
        if (!data.to) { console.warn(`[Socket ${socket.id}][message] Ignored: Missing recipient ('to' field).`); return; }

        console.log(`[Socket ${socket.id}][message] Received. To: ${data.to}, ImgId: ${data.imageFileId}`);

        // --- Prepare Payloads ---
        let messagePayloadDB; // For storing in database
        try {
            messagePayloadDB = {
                message: `${socket.name}: ${data.msg || ''}`, // Keep original format?
                timestamp: Date.now(),
                ...(data.imageFileId && ObjectId.isValid(data.imageFileId) ? { imageFileId: new ObjectId(data.imageFileId) } : {})
            };
            if (data.imageFileId && !messagePayloadDB.imageFileId) console.warn(`[Socket ${socket.id}][message] Invalid imageFileId received: ${data.imageFileId}. Storing message without image.`);
        } catch (payloadError) { console.error(`[Socket ${socket.id}][message] Error creating DB payload (invalid imageFileId '${data.imageFileId}'):`, payloadError); socket.emit("message_error", { error: "Invalid message format." }); return; }

        const emitPayload = { sender: socket.name, msg: data.msg || '', server: data.to === "server", timestamp: messagePayloadDB.timestamp, imageFileId: data.imageFileId && ObjectId.isValid(data.imageFileId) ? data.imageFileId : null };

        // --- Determine Target & Identifiers ---
        const isServerBroadcast = emitPayload.server;
        const dbSenderIdentifier = isServerBroadcast ? "server" : (socket.name > data.to ? socket.name + data.to : data.to + socket.name);
        const roomName = dbSenderIdentifier;

        // --- Database Update ---
        try {
             const recipientsQuery = isServerBroadcast ? { username: { $ne: "guest" } } : { username: { $in: [socket.name, data.to] } };
             const recipients = await mod.find(recipientsQuery).select('token').lean();
             for (let user of recipients) {
                 const recordExists = await check_sender_record_exists(user.token, dbSenderIdentifier);
                 let updateOp = recordExists
                   ? mod.updateOne({ token: user.token, "message_record.sender": dbSenderIdentifier }, { $push: { "message_record.$.messages": messagePayloadDB } })
                   : mod.updateOne({ token: user.token }, { $push: { message_record: { sender: dbSenderIdentifier, messages: [messagePayloadDB] } } });
                 await updateOp;
             }
            console.log(`[Socket ${socket.id}][message] Saved to DB for key: ${dbSenderIdentifier}, ${recipients.length} recipients.`);
        } catch (dbError) { console.error(`[Socket ${socket.id}][message] DB Error (key: ${dbSenderIdentifier}):`, dbError); socket.emit("message_error", { error: "Failed to save message." }); return; }

        // --- Socket Emission ---
        if (isServerBroadcast) { /* Emit globally */ console.log(`[Socket ${socket.id}][message] Emitting server broadcast.`); io.emit("message", emitPayload); }
        else { /* Emit to room */
            const recipientSocket = Array.from(io.sockets.sockets.values()).find(s => s.name === data.to);
            if (recipientSocket) await recipientSocket.join(roomName);
            await socket.join(roomName);
            console.log(`[Socket ${socket.id}][message] Emitting to room ${roomName}.`); io.to(roomName).emit("message", emitPayload);
        }
    });

    // --- Pretext (Load History) Handler ---
    socket.on("pretext", async (data) => {
         if (!mod || !socket.token) { console.error(`[Socket ${socket.id}][pretext] Model/token not ready.`); return; }
         if (!data || !data.to) { console.warn(`[Socket ${socket.id}][pretext] Missing 'to' field.`); return; }

         console.log(`[Socket ${socket.id}][pretext] Request for target: ${data.to}`);
         const targetUser = data.to;
         const isServerHistory = targetUser === "server";
         const dbSenderIdentifier = isServerHistory ? "server" : (socket.name > targetUser ? socket.name + targetUser : targetUser + socket.name);

         try {
             const userRecord = await mod.findOne({ token: socket.token }, { message_record: { $elemMatch: { sender: dbSenderIdentifier } } }).lean();
             let messagesToSend = [];
             if (userRecord?.message_record?.length > 0) {
                 messagesToSend = userRecord.message_record[0].messages.map(msg => {
                     const messageParts = msg.message.split(':', 2); // Assuming 'sender: text' format in DB
                     return { sender: messageParts[0] || 'unknown', msg: (messageParts[1] || '').trim(), timestamp: msg.timestamp, imageFileId: msg.imageFileId ? msg.imageFileId.toString() : null };
                 });
                 console.log(`[Socket ${socket.id}][pretext] Found ${messagesToSend.length} msgs for key: ${dbSenderIdentifier}`);
             } else { console.log(`[Socket ${socket.id}][pretext] No history found for key: ${dbSenderIdentifier}`); }
             socket.emit("load_message", { forUser: targetUser, messages: messagesToSend });

             if (isServerHistory) { // Send user list for server chat
                 const allUsers = await mod.find({ username: { $nin: ["guest", socket.name]} }, { username: 1 }).lean();
                 console.log(`[Socket ${socket.id}][pretext] Emitting user list (${allUsers.length} users).`);
                 allUsers.forEach(user => socket.emit("user", user.username));
             }
         } catch (err) { console.error(`[Socket ${socket.id}][pretext] Error for ${targetUser}:`, err); socket.emit("load_message", { forUser: targetUser, messages: [] }); }
    });

    // --- Disconnect Handler ---
    socket.on("disconnect", (reason) => {
        console.log(`[Socket Disconnect] ID: ${socket.id}, Name: ${socket.name || 'Guest'}, Reason: ${reason}`);
        if (socket.name) { /* Notify others if needed: io.emit("user_left", socket.name); */ }
    });

}); // End of io.on("connect")


// ========================================================
//              START SERVER & DEFINE HTTP ROUTES
// ========================================================
console.log("Attempting script execution: Connecting to database...");
conndb().then(() => {
    // This block runs ONLY after conndb() completes successfully
    console.log("[Startup] Database & Middleware Initialized. Setting up HTTP routes...");

    // --- Define HTTP GET Route for Images ---
    app.get('/image/:fileId', async (req, res) => {
         console.log(`[HTTP GET /image] Request for ID: ${req.params.fileId}`);
         try {
            if (!gfs || !db) return res.status(503).send('Storage service not available.');
            const fileIdString = req.params.fileId;
            if (!ObjectId.isValid(fileIdString)) { console.warn(`[HTTP GET /image] Invalid File ID format: ${fileIdString}`); return res.status(400).send('Invalid File ID format'); }
            const fileId = new ObjectId(fileIdString);
            const file = await db.collection(`${GRIDFS_BUCKET_NAME}.files`).findOne({ _id: fileId }); // Explicit collection name
            if (!file) { console.log(`[HTTP GET /image] File not found in DB: ${fileIdString}`); return res.status(404).send('Image not found'); }

            console.log(`[HTTP GET /image] Streaming file ${fileIdString} (${file.filename})`);
            res.set('Content-Type', file.contentType || 'application/octet-stream');
            // res.set('Content-Length', file.length);
            // res.set('Cache-Control', 'public, max-age=31536000'); // Example: Cache for 1 year

            const downloadStream = gfs.openDownloadStream(fileId);
            downloadStream.on('error', (streamError) => { console.error(`[HTTP GET /image] Error streaming file ${fileIdString}:`, streamError); if (!res.headersSent) res.status(500).send('Error retrieving image'); else downloadStream.destroy(); });
            downloadStream.pipe(res);
        } catch (routeError) { console.error(`[HTTP GET /image] Unexpected error for ID ${req.params.fileId}:`, routeError); if (!res.headersSent) res.status(500).send('Server error retrieving image'); }
    });

    // --- Define HTTP POST Route for Image Uploads (MANUAL GridFS Save) ---
    app.post('/upload/image', (req, res, next) => {
        console.log("[HTTP POST /upload/image] Route hit.");
        if (!upload) { console.error("[HTTP POST /upload/image] Upload middleware not ready!"); return res.status(503).send('Upload service temporarily unavailable.'); }
        if (!gfs) { console.error("[HTTP POST /upload/image] GridFS not initialized!"); return res.status(503).send('Storage service unavailable.'); }

        // Execute multer middleware (memory storage)
        upload.single('imageFile')(req, res, async (err) => { // Make callback async
            // Handle Multer errors (parsing, filter rejection, limits)
            if (err) { console.error('[HTTP POST /upload/image] Error reported by Multer middleware:', err.message); return res.status(400).json({ error: err.message || 'File upload processing failed.' }); }
            if (!req.file) { console.error("[HTTP POST /upload/image] Upload failed: Middleware finished, but req.file is missing."); return res.status(400).json({ error: 'No file received or file type rejected.' }); }

            console.log(`[HTTP POST /upload/image] File received in memory: ${req.file.originalname}, Size: ${req.file.size}`);

            // Manually Save Buffer to GridFS
            try {
                const filename = `image-${Date.now()}-${randomBytes(4).toString('hex')}-${req.file.originalname}`;
                console.log(`[HTTP POST /upload/image] Creating GridFS upload stream for: ${filename}`);

                const readableStream = Readable.from(req.file.buffer); // Create stream from buffer
                const uploadStream = gfs.openUploadStream(filename, { contentType: req.file.mimetype }); // Open GridFS stream

                let fileId = null; // To store the ID after finish

                uploadStream.on('error', (gridfsError) => {
                    console.error(`[HTTP POST /upload/image] GridFS stream error for ${filename}:`, gridfsError);
                    if (!res.headersSent) { res.status(500).json({ error: 'Failed to save image to storage.' }); }
                });

                uploadStream.on('finish', () => {
                    // Instead of relying on the 'uploadedFile' argument,
                    // access the ID and filename directly from the stream object.
                    const savedFileId = uploadStream.id; // The ID should be available here
                    const savedFilename = uploadStream.options?.filename || 'unknown'; // Filename from options

                    if (!savedFileId) {
                        // This would be highly unusual if 'finish' fired without error
                         console.error(`[HTTP POST /upload/image] GridFS stream finished, but NO file ID found on the stream object! Original: ${req.file.originalname}`);
                         if (!res.headersSent) {
                             res.status(500).json({ error: 'Failed to retrieve file ID after saving.' });
                         }
                         return; // Stop
                    }

                    console.log(`[HTTP POST /upload/image] GridFS stream finished. File saved: ${savedFilename}, ID: ${savedFileId}`);

                    // Send success response using the ID obtained from the stream
                    if (!res.headersSent) {
                         res.status(201).json({ fileId: savedFileId });
                    } else {
                        console.warn(`[HTTP POST /upload/image] Headers already sent before GridFS finished for ${savedFilename}. Response may be incomplete.`);
                    }
                });

                // Pipe data to GridFS
                console.log(`[HTTP POST /upload/image] Piping buffer to GridFS for ${filename}...`);
                readableStream.pipe(uploadStream);

            } catch (manualSaveError) {
                 console.error(`[HTTP POST /upload/image] Unexpected error during manual GridFS save logic for ${req.file.originalname}:`, manualSaveError);
                 if (!res.headersSent) { res.status(500).json({ error: 'Server error saving image.' }); }
            }
            // Response is now sent via the 'finish' event listener
        });
    });

    // --- Root Route & Start Listening ---
    app.get('/', (req, res) => { res.status(200).send('Chat Server is running.'); });
    httpserver.listen(PORT, () => { console.log(`[Startup] Server listening on http://localhost:${PORT}`); });

}).catch(err => { // Catches errors from conndb() promise itself
     console.error("[Startup CRITICAL] Failed to initialize database/middleware. Server not started.", err);
     process.exit(1);
});

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
    console.log('\n[Shutdown] SIGINT received. Closing server...');
    io.close(() => { console.log('[Shutdown] Socket.IO closed.'); }); // Close Socket.IO first
    httpserver.close(() => {
        console.log('[Shutdown] HTTP server closed.');
        mong.connection.close(false).then(() => { console.log('[Shutdown] MongoDB connection closed.'); process.exit(0); })
            .catch(err => { console.error('[Shutdown] Error closing MongoDB:', err); process.exit(1); });
    });
    setTimeout(() => { console.error('[Shutdown] Forcing shutdown.'); process.exit(1); }, 10000); // Timeout
});