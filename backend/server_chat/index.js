const { createServer } = require("http");
const { Server } = require("socket.io");
const { randomBytes } = require("crypto");
const mong = require("mongoose");
const express = require("express");
const multer = require("multer");
const { GridFSBucket, ObjectId } = require("mongodb");
const cors = require('cors');
const { Readable } = require('stream');

const databaseUri = "mongodb+srv://us1:test1@cluster0.2h4r1.mongodb.net/";
const PORT = process.env.PORT || 3800;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const GRIDFS_BUCKET_NAME = "uploads";

const app = express();
app.use(cors({ origin: "*" }));
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

let db;
let gfs;
let mod;
let upload;

async function checkSenderRecordExists(username, senderIdentifier) {
    if (!mod) { console.error("[Helper Check Sender] Model not loaded!"); return false; }
    const user = await mod.findOne({ username: username, "message_record.sender": senderIdentifier }, { _id: 1 }).lean();
    return !!user;
}

const connectDatabase = async () => {
    try {
        console.log(`[Init] Connecting to MongoDB...`);
        const conn = await mong.connect(databaseUri);
        console.log("[Init] MongoDB connected successfully.");
        db = conn.connection.db;

        if (!db || typeof db.collection !== 'function') throw new Error("Failed to get valid native DB driver instance.");
        console.log("[Init DEBUG] 'db' object obtained successfully.");

        gfs = new GridFSBucket(db, { bucketName: GRIDFS_BUCKET_NAME });
        console.log(`[Init] GridFSBucket initialized (bucket: ${GRIDFS_BUCKET_NAME}).`);

        mod = require("./model_client");
        if (!mod || typeof mod.findOne !== 'function') throw new Error("Failed to load Mongoose model or model is invalid (check schema).");
        console.log("[Init] Client Mongoose model loaded successfully.");

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
        console.error("[Init CRITICAL] Initialization error in connectDatabase function:", error);
        process.exit(1);
    }
};

io.on("connect", socket => {
    console.log(`[Socket Connect] ID: ${socket.id}, Transport: ${socket.conn.transport.name}`);
    socket.name = null;

    (async () => {
        const queryName = socket.handshake.query.name;
        console.log(`[Socket ${socket.id}] Handshake query:`, { name: queryName });
        if (queryName) {
             try {
                if (!mod) await new Promise(resolve => setTimeout(resolve, 150));
                if (!mod) throw new Error("Model 'mod' not available during connect handler!");

                const user = await mod.findOne({ username: queryName }).lean();
                if (user) {
                    socket.name = user.username;
                    console.log(`[Socket ${socket.id}] User '${socket.name}' identified via handshake query.`);
                } else {
                     console.log(`[Socket ${socket.id}] Name '${queryName}' from handshake query not found in DB. Waiting for 'con' event.`);
                }
            } catch (err) {
                console.error(`[Socket ${socket.id}] Error during handshake name check:`, err);
            }
        } else {
             console.log(`[Socket ${socket.id}] No name in handshake query. Waiting for 'con' event.`);
        }
    })();


    socket.on("con", async (data) => {
        console.log(`[Socket ${socket.id}][con] Received. Current Auth: ${socket.name || 'None'}. Data:`, { nam: data?.nam });
        if (!mod) { console.error(`[Socket ${socket.id}][con] Model not ready!`); socket.emit("login_error", { message:"Server not ready"}); return; }
        if (socket.name) { console.warn(`[Socket ${socket.id}][con] Already identified as ${socket.name}. Ignoring.`); socket.emit("authenticated", { name: socket.name }); return; }

        const userName = data?.nam?.trim();
        if (!userName) { socket.emit("login_error", { message: "Username ('nam' field) required." }); return; }
        if (userName.length > 30 || userName.length < 3) { socket.emit("login_error", { message: "Username must be between 3 and 30 characters."}); return; }
        if (/\s/.test(userName)) { socket.emit("login_error", { message: "Username cannot contain spaces."}); return; }

        try {
            let user = await mod.findOne({ username: userName });

            if (user) {
                console.log(`[Socket ${socket.id}][con] User '${userName}' found. Logging in.`);
                socket.name = user.username;
                console.log(`[Socket ${socket.id}][con] Socket identified as '${socket.name}'.`);
                socket.emit("authenticated", { name: socket.name });
                socket.emit("done", "Login successful");
                io.emit("user", socket.name);

            } else {
                 console.log(`[Socket ${socket.id}][con] User '${userName}' not found. Creating.`);
                 const newUser = new mod({
                     username: userName,
                     message_record: []
                 });
                 await newUser.save();
                 socket.name = newUser.username;
                 console.log(`[Socket ${socket.id}][con] New user '${socket.name}' created and identified.`);
                 socket.emit("authenticated", { name: socket.name });
                 socket.emit("done", "Account created successfully");
                 io.emit("user", socket.name);
            }
        } catch (err) {
             if (err.code === 11000) {
                 console.warn(`[Socket ${socket.id}][con] Race condition or duplicate username attempt for '${userName}'.`);
                 let existingUser = await mod.findOne({ username: userName });
                 if (existingUser) {
                     socket.name = existingUser.username;
                     console.log(`[Socket ${socket.id}][con] Identified as '${socket.name}' after duplicate error.`);
                     socket.emit("authenticated", { name: socket.name });
                     socket.emit("done", "Login successful");
                     io.emit("user", socket.name);
                 } else {
                      console.error(`[Socket ${socket.id}][con] Duplicate error for '${userName}' but user not found after check. Error:`, err);
                      socket.emit("login_error", { message: "Username might be taken, or server error." });
                 }
             } else {
                 console.error(`[Socket ${socket.id}][con] Error:`, err);
                 socket.emit("login_error", { message: "Server error during authentication." });
             }
        }
    });

    socket.on("message", async (data) => {
        if (!mod) { console.error(`[Socket ${socket.id}][message] Model not ready.`); return; }
        if (!socket.name) { console.warn(`[Socket ${socket.id}][message] Ignored: Unauthenticated socket. Please use 'con' event first.`); socket.emit("error", { message: "Please identify yourself first using the 'con' event."}); return; }
        if (!data || (!data.msg?.trim() && !data.imageFileId)) { console.warn(`[Socket ${socket.id}][message] Ignored: Empty message content.`); return; }
        if (!data.to) { console.warn(`[Socket ${socket.id}][message] Ignored: Missing recipient ('to' field).`); return; }

        console.log(`[Socket ${socket.id}][message] Received from '${socket.name}'. To: ${data.to}, ImgId: ${data.imageFileId}`);

        let messagePayloadDB;
        try {
            messagePayloadDB = {
                message: `${socket.name}: ${data.msg || ''}`.trim(),
                timestamp: Date.now(),
                ...(data.imageFileId && ObjectId.isValid(data.imageFileId) ? { imageFileId: new ObjectId(data.imageFileId) } : {})
            };
            if (data.imageFileId && !messagePayloadDB.imageFileId) console.warn(`[Socket ${socket.id}][message] Invalid imageFileId received: ${data.imageFileId}. Storing message without image.`);
            if (!messagePayloadDB.message.split(': ')[1] && !messagePayloadDB.imageFileId) {
                 console.warn(`[Socket ${socket.id}][message] Ignored: Empty message text and no valid image.`);
                 return;
            }
        } catch (payloadError) { console.error(`[Socket ${socket.id}][message] Error creating DB payload (invalid imageFileId '${data.imageFileId}'):`, payloadError); socket.emit("message_error", { error: "Invalid message format." }); return; }

        const emitPayload = {
            sender: socket.name,
            msg: data.msg || '',
            server: data.to === "server",
            timestamp: messagePayloadDB.timestamp,
            imageFileId: data.imageFileId && ObjectId.isValid(data.imageFileId) ? data.imageFileId.toString() : null
        };

        const isServerBroadcast = emitPayload.server;
        const dbSenderIdentifier = isServerBroadcast ? "server" : ([socket.name, data.to].sort().join(''));
        const roomName = dbSenderIdentifier;

        try {
             const recipientsQuery = isServerBroadcast
                ? { username: { $ne: "system" } }
                : { username: { $in: [socket.name, data.to] } };

             const recipients = await mod.find(recipientsQuery).select('username').lean();

             if (!isServerBroadcast && recipients.length < 2) {
                 const recipientExists = await mod.exists({ username: data.to });
                 if (!recipientExists) {
                     console.warn(`[Socket ${socket.id}][message] Recipient '${data.to}' not found. Message not saved for them.`);
                     recipients.splice(recipients.findIndex(u => u.username === data.to), 1);
                     if (recipients.length === 0) {
                          console.error(`[Socket ${socket.id}][message] Sender '${socket.name}' not found in DB during save. Aborting save.`);
                          socket.emit("message_error", { error: "Failed to save message (sender not found)." });
                          return;
                     }
                 }
             }

             for (let user of recipients) {
                 const recordExists = await checkSenderRecordExists(user.username, dbSenderIdentifier);

                 let updateOp;
                 if (recordExists) {
                     updateOp = mod.updateOne(
                         { username: user.username, "message_record.sender": dbSenderIdentifier },
                         { $push: { "message_record.$.messages": messagePayloadDB } }
                     );
                 } else {
                     updateOp = mod.updateOne(
                         { username: user.username },
                         { $push: { message_record: { sender: dbSenderIdentifier, messages: [messagePayloadDB] } } }
                     );
                 }
                 await updateOp;
             }
            console.log(`[Socket ${socket.id}][message] Saved to DB for key: ${dbSenderIdentifier}, ${recipients.length} recipients affected.`);
        } catch (dbError) { console.error(`[Socket ${socket.id}][message] DB Error (key: ${dbSenderIdentifier}):`, dbError); socket.emit("message_error", { error: "Failed to save message." }); return; }

        if (isServerBroadcast) {
            console.log(`[Socket ${socket.id}][message] Emitting server broadcast.`);
            io.emit("message", emitPayload);
        } else {
            const recipientSocket = Array.from(io.sockets.sockets.values()).find(s => s.name === data.to);

            await socket.join(roomName);
            if (recipientSocket) {
                await recipientSocket.join(roomName);
                console.log(`[Socket ${socket.id}][message] Emitting to room ${roomName} (recipient ${data.to} connected).`);
            } else {
                 console.log(`[Socket ${socket.id}][message] Emitting to room ${roomName} (recipient ${data.to} not connected).`);
            }
            io.to(roomName).emit("message", emitPayload);
        }
    });

    socket.on("pretext", async (data) => {
         if (!mod || !socket.name) { console.error(`[Socket ${socket.id}][pretext] Model not ready or socket not identified.`); return; }
         if (!data || !data.to) { console.warn(`[Socket ${socket.id}][pretext] Missing 'to' field.`); return; }

         console.log(`[Socket ${socket.id}][pretext] Request from '${socket.name}' for target: ${data.to}`);
         const targetUser = data.to;
         const isServerHistory = targetUser === "server";
         const dbSenderIdentifier = isServerHistory ? "server" : ([socket.name, targetUser].sort().join(''));

         try {
             const userRecord = await mod.findOne(
                 { username: socket.name },
                 { message_record: { $elemMatch: { sender: dbSenderIdentifier } } }
             ).lean();

             let messagesToSend = [];
             if (userRecord?.message_record?.length > 0) {
                 messagesToSend = userRecord.message_record[0].messages.map(msg => {
                     const messageParts = msg.message.split(':', 2);
                     return {
                         sender: messageParts[0] || 'unknown',
                         msg: (messageParts[1] || '').trim(),
                         timestamp: msg.timestamp,
                         imageFileId: msg.imageFileId ? msg.imageFileId.toString() : null
                     };
                 });
                 console.log(`[Socket ${socket.id}][pretext] Found ${messagesToSend.length} msgs for key: ${dbSenderIdentifier}`);
             } else { console.log(`[Socket ${socket.id}][pretext] No history found for key: ${dbSenderIdentifier}`); }

             socket.emit("load_message", { forUser: targetUser, messages: messagesToSend });

             if (isServerHistory) {
                 const allUsers = await mod.find(
                     { username: { $nin: ["system", "guest", socket.name]} },
                     { username: 1, _id: 0 }
                 ).lean();
                 console.log(`[Socket ${socket.id}][pretext] Emitting user list (${allUsers.length} users) for server chat.`);
                 allUsers.forEach(user => socket.emit("user", user.username));
             }
         } catch (err) {
            console.error(`[Socket ${socket.id}][pretext] Error loading history for target '${targetUser}':`, err);
            socket.emit("load_message", { forUser: targetUser, messages: [] });
         }
    });

    socket.on("disconnect", (reason) => {
        console.log(`[Socket Disconnect] ID: ${socket.id}, Name: ${socket.name || 'Not Identified'}, Reason: ${reason}`);
        if (socket.name) {
             io.emit("user_left", socket.name);
             console.log(`[Socket ${socket.id}] User '${socket.name}' disconnected.`);
        }
    });

});

console.log("Attempting script execution: Connecting to database...");
connectDatabase().then(() => {
    console.log("[Startup] Database & Middleware Initialized. Setting up HTTP routes...");

    app.get('/image/:fileId', async (req, res) => {
         console.log(`[HTTP GET /image] Request for ID: ${req.params.fileId}`);
         try {
            if (!gfs || !db) return res.status(503).send('Storage service not available.');
            const fileIdString = req.params.fileId;
            if (!ObjectId.isValid(fileIdString)) { console.warn(`[HTTP GET /image] Invalid File ID format: ${fileIdString}`); return res.status(400).send('Invalid File ID format'); }
            const fileId = new ObjectId(fileIdString);
            const file = await db.collection(`${GRIDFS_BUCKET_NAME}.files`).findOne({ _id: fileId });
            if (!file) { console.log(`[HTTP GET /image] File not found in DB: ${fileIdString}`); return res.status(404).send('Image not found'); }

            console.log(`[HTTP GET /image] Streaming file ${fileIdString} (${file.filename})`);
            res.set('Content-Type', file.contentType || 'application/octet-stream');

            const downloadStream = gfs.openDownloadStream(fileId);
            downloadStream.on('error', (streamError) => { console.error(`[HTTP GET /image] Error streaming file ${fileIdString}:`, streamError); if (!res.headersSent) res.status(500).send('Error retrieving image'); else downloadStream.destroy(); });
            downloadStream.pipe(res);
        } catch (routeError) { console.error(`[HTTP GET /image] Unexpected error for ID ${req.params.fileId}:`, routeError); if (!res.headersSent) res.status(500).send('Server error retrieving image'); }
    });

    app.post('/upload/image', (req, res, next) => {
        console.log("[HTTP POST /upload/image] Route hit.");
        if (!upload) { console.error("[HTTP POST /upload/image] Upload middleware not ready!"); return res.status(503).send('Upload service temporarily unavailable.'); }
        if (!gfs) { console.error("[HTTP POST /upload/image] GridFS not initialized!"); return res.status(503).send('Storage service unavailable.'); }

        upload.single('imageFile')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('[HTTP POST /upload/image] Multer error:', err.message);
                return res.status(400).json({ error: `File upload error: ${err.message}` });
            } else if (err) {
                console.error('[HTTP POST /upload/image] Non-Multer error during upload middleware:', err.message);
                return res.status(400).json({ error: err.message || 'File upload processing failed.' });
            }
            if (!req.file) { console.error("[HTTP POST /upload/image] Upload failed: Middleware finished, but req.file is missing."); return res.status(400).json({ error: 'No file received or file type rejected.' }); }

            console.log(`[HTTP POST /upload/image] File received in memory: ${req.file.originalname}, Size: ${req.file.size}, Type: ${req.file.mimetype}`);

            try {
                const uniqueSuffix = randomBytes(8).toString('hex');
                const filename = `image-${Date.now()}-${uniqueSuffix}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                console.log(`[HTTP POST /upload/image] Creating GridFS upload stream for: ${filename}`);

                const readableStream = Readable.from(req.file.buffer);
                const uploadStream = gfs.openUploadStream(filename, {
                    contentType: req.file.mimetype
                });

                uploadStream.on('error', (gridfsError) => {
                    console.error(`[HTTP POST /upload/image] GridFS stream error for ${filename}:`, gridfsError);
                    readableStream.unpipe(uploadStream);
                    if (!res.headersSent) { res.status(500).json({ error: 'Failed to save image to storage.' }); }
                });

                uploadStream.on('finish', () => {
                    const savedFileId = uploadStream.id;
                    const savedFilename = uploadStream.options?.filename || 'unknown';

                    if (!savedFileId) {
                         console.error(`[HTTP POST /upload/image] GridFS stream finished, but NO file ID found on the stream object! Original: ${req.file.originalname}`);
                         if (!res.headersSent) { res.status(500).json({ error: 'Failed to retrieve file ID after saving.' }); }
                         return;
                    }

                    console.log(`[HTTP POST /upload/image] GridFS stream finished. File saved: ${savedFilename}, ID: ${savedFileId}`);
                    if (!res.headersSent) {
                         res.status(201).json({ fileId: savedFileId.toString() });
                    } else {
                        console.warn(`[HTTP POST /upload/image] Headers already sent before GridFS finished for ${savedFilename}.`);
                    }
                });

                console.log(`[HTTP POST /upload/image] Piping buffer to GridFS for ${filename}...`);
                readableStream.pipe(uploadStream);

            } catch (manualSaveError) {
                 console.error(`[HTTP POST /upload/image] Unexpected error during manual GridFS save logic for ${req.file.originalname}:`, manualSaveError);
                 if (!res.headersSent) { res.status(500).json({ error: 'Server error saving image.' }); }
            }
        });
    });

    app.get('/', (req, res) => { res.status(200).send('Chat Server is running.'); });
    httpServer.listen(PORT, () => { console.log(`[Startup] Server listening on http://localhost:${PORT}`); });

}).catch(err => {
     console.error("[Startup CRITICAL] Failed to initialize database/middleware. Server not started.", err);
     process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n[Shutdown] SIGINT received. Closing server...');
    io.close(() => { console.log('[Shutdown] Socket.IO closed.'); });
    httpServer.close(() => {
        console.log('[Shutdown] HTTP server closed.');
        mong.connection.close(false).then(() => { console.log('[Shutdown] MongoDB connection closed.'); process.exit(0); })
            .catch(err => { console.error('[Shutdown] Error closing MongoDB:', err); process.exit(1); });
    });
    setTimeout(() => { console.error('[Shutdown] Forcing shutdown due to timeout.'); process.exit(1); }, 10000);
});