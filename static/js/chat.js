$(() => {

    /*

    TODO:

    1 - Need to add the chat in session into flask app.
    2 - Need to getMessages for said chat.
    DONE!! NOT!!

    New issues:
    1' - Need to open socket connection on opening an outsider chat
    DONE!!

    3 - Need to fix the layout of the messages__history. Maybe a little ugly?
     -> Maybe add a bubble!
     DONE!!



     
    4 - Need to fix multiple chats
    -> More info: Happens for people who create chats, talk in them, and then log out!

    */

    const message_template = Handlebars.compile(document.getElementById("message-template").innerHTML)
    const socket = io();

    // sidebar menu html behaviour

    const menu_trigger = document.querySelector(".menu__trigger")
    let is_menu_open = true
    const menu = document.querySelector(".menu--wrapper")
    menu_trigger.onclick = () => {
        if (is_menu_open) {
            menu.style.marginLeft = "-300px"
            is_menu_open = false;
            menu_trigger.style.transform = "rotate(180deg)";
        } else {
            menu.style.marginLeft = "0px"
            is_menu_open = true;
            menu_trigger.style.transform = "rotate(0deg)";
        }
    }
    
    const button_myrooms = document.querySelector("#button_myrooms")
    const button_join = document.querySelector("#button_join")
    const button_create = document.querySelector("#button_create")
    const menu_grid = document.querySelector(".menu__grid")

    button_myrooms.onclick = () => { menu_grid.style.left = "0px" }
    button_join.onclick = () => { menu_grid.style.left = "-300px" }
    button_create.onclick = () => { menu_grid.style.left = "-600px" }

    // sidebar back-end

    const createChannelForm = document.querySelector("#createChannelForm");
    createChannelForm.onsubmit = (e) => {
        e.preventDefault();
        const channelNameInput = document.getElementsByName("channelName")[0]
        const channelName = channelNameInput.value;
        const emptyError = document.querySelector("#createChannelForm--empty")
        const uniqueError = document.querySelector("#createChannelForm--unique")
        //console.log(channelName)
        if (channelName == "") { emptyError.classList.remove("d-none");uniqueError.classList.add("d-none"); return false} 
        else { emptyError.classList.add("d-none");uniqueError.classList.add("d-none") }
        
        fetch(url="/create", {method: 'POST',
                        //headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({"channelName": channelName})
                    })
        .then(function json(response) {return response.json()} ).then(
            function(data) {
                
                //console.log(data["success"])
                if (data["success"] == true) {
                    socket.emit("channel_created", {"channelName": document.getElementsByName("channelName")[0].value, 
                    "User": document.getElementById("chatbox").children[0].value });
                    // logic for adding the channel into myrooms
                    const channelName = document.getElementsByName("channelName")[0].value;
                    const myRoomsMenu = document.querySelector(".menu__grid__myrooms__rooms")
                    const newChannel = document.createElement("div")


                    newChannel.setAttribute("class", "menu__grid__myrooms__rooms__item")
                    newChannel.setAttribute("data", `name: ${channelName}`)
                    newChannel.innerHTML = document.getElementsByName("channelName")[0].value;
                    myRoomsMenu.append(newChannel)

                    //renew important consts
                    const myRoomsMenuAddition = myRoomsMenu.children[myRoomsMenu.children.length - 1]
                    console.log(myRoomsMenuAddition)
                    myRoomsMenuAddition.addEventListener('click', getMessages, false)
                    myRoomsMenuAddition.node = myRoomsMenuAddition.innerHTML
                    /*

                    KEEP IN MIND:

                    the onclick function is actually being called. the onclick needs to seperately be assigned to getMessages()
                    DONE!
                    */
                    
                    document.getElementsByName("channelName")[0].value = ""
                    // TODO: add onclick behaviour. DONE!
                    // TODO: add onclick behaviour to chat on startup.
                } else {uniqueError.classList.remove("d-none")}
            }
        )
    }

    function getMessages(event) {
        console.log("Someone Entered here")
        const channelName = this.innerHTML
        console.log(this.innerHTML)
        console.log(channelName)
        fetch(url="/messages", {method: 'POST',
            body: JSON.stringify({"channelName": channelName})})
        .then(function json(response) { return response.json() })
        .then(function(data) {
            const messages = data
            console.log(data)
            const messages_container = document.querySelector("#message")
            messages_container.querySelector("h1").innerHTML = channelName
            const messages_history = document.querySelector(".messages__history")
            messages_history.innerHTML = ""
            for (var i=0; i < messages.length; i++) {
                const chatHistoryTemplate = message_template(messages[i])
                const messageRow = document.createElement("div")
                messageRow.setAttribute("class", "message__item")
                messageRow.innerHTML = chatHistoryTemplate
                messages_history.append(messageRow)
            }
            // important!! 
            // need to add a div around the messages so that getMessages for a new channel can OVERWRITE existing messages. done!!
            socket.emit("channel_opened", {"channelName": channelName})
            //also emit channel_opened.
            // need to emit join, so that join_room can be called in order to have rooms in chats. done!!

            // LATEST IMPORTANT:
            // url /messages returns only a list of messages. need a list of objects. DONE!!

        })
    }

    const allMyRooms = document.querySelectorAll(".menu__grid__myrooms__rooms__item")
    for (var i = 0; i < allMyRooms.length; i++) {
        allMyRooms[i].onclick = getMessages
    }

    socket.on("channel_was_created", data => {
        const User = data.User
        const channelName = data.channelName
        console.log(User, channelName)

        if (User != document.getElementById("chatbox").children[0].value) {
            const joinMenu = document.querySelector(".menu__grid__join__rooms")
            const newChannel = document.createElement("div")
            newChannel.setAttribute("class", "menu__grid__join__rooms__item")
            newChannel.innerHTML = channelName;
            joinMenu.append(newChannel)
            const lastChild = joinMenu.children[joinMenu.children.length - 1]
            lastChild.onclick = joinNewMenu
            // TODO: add onclick behaviour
        }
    })

    function joinNewMenu(event) {
        const channelName = this.innerHTML;
        const channel = this
        console.log(this)
        fetch(url="/join", {method: "POST",
            body: JSON.stringify({"channelName": channelName})})
        .then(function json(response) { return response.json() })
        .then(function(data) {
            const myRoomsMenu = document.querySelector(".menu__grid__myrooms__rooms")
            const Addition = document.createElement("div")
            const joinMenu = document.querySelector(".menu__grid__join__rooms")
            channel.parentNode.removeChild(channel)
            Addition.setAttribute("class", "menu__grid__myrooms__rooms__item")
            Addition.innerHTML = channelName
            Addition.onclick = getMessages
            myRoomsMenu.append(Addition)

        })
    }

    const allJoinMenus = document.querySelectorAll(".menu__grid__join__rooms__item")
    for (var i=0; i < allJoinMenus.length; i++) {
        allJoinMenus[i].onclick = joinNewMenu
    }

    const isUserInLegacySession = document.getElementById("isUserInLegacySession")
    if (isUserInLegacySession.value == "True") {
        socket.emit("channel_opened", {"channelName": isUserInLegacySession.dataset.room})
    }

    const message_form = document.getElementById("chatbox")
    message_form.onsubmit = (e) => {
        e.preventDefault();
        const msg = message_form.children[1].value;
        const Username = message_form.children[0].value;
        console.log(msg, Username)
        message_form.children[1].value = "";
        socket.emit("message_sent", {"msg": msg, "Username": Username})
        return false;
    }
    socket.on("message_received", (data) => {
        console.log(data)
        const context = data;
        const message_html = message_template({"Username": data["Username"], "msg": data["msg"]})
        const message_row = document.createElement("div")
        message_row.setAttribute("class", "message__item")
        console.log(message_html)
        message_row.innerHTML = message_html;
        const message_list = document.querySelector(".messages__history")
        message_list.appendChild(message_row)
    })

})