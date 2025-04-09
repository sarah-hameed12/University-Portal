if (token in users && ch){
    if (users[token] == ""){
        users[token] = socket.handshake.query.name
    }
    socket.name = users[token]
    socket.token = socket.handshake.query.token
    console.log(socket.name)
}
else if (ch) {
    var token2 = gen_token()
    un = un + 1
    var pwd = socket.handshake.query.pwd
    //console.log(socket.handshake.query.token)
    //console.log(socket.handshake.query.pwd)
    console.log("pwd: ", pwd)
    var tun = -1
    var hash = await get_hash(pwd,1)
    var check = await mod.findOne({username: socket.handshake.query.name, password: hash })
    if (check != null){
        console.log("I KNOW")
        token2 = check.token
        for (key in Object.keys(unique_ids)){
            if (unique_ids[key] == token2){
                tun = key
                break 
            }
        }
    }
    else {
        tun = un + 1
        let nuser = new mod({
            username: socket.handshake.query.name || "guest",
            password: hash,
            token: token2
        })
        await nuser.save()
    }
    check = await mod.findOne({username: socket.handshake.query.name || "guest", password: hash })
    console.log(check.username, check.password, check.token)


    socket.emit("token",token2)
    users[token2] = socket.handshake.query.name
    socket.name = socket.handshake.query.name
    socket.token = socket.handshake.query.name

    unique_ids[tun] = token2
    if (tun > un){
        un = tun
    }
    //console.log(socket.name)
}