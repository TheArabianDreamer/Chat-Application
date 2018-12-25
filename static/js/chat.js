$(() => {
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

                    const myRoomsMenu = document.querySelector(".menu__grid__myrooms__rooms")
                    const newChannel = document.createElement("div")
                    newChannel.setAttribute("class", "menu__grid__myrooms__rooms__item")

                    newChannel.onclick = () => {
                        fetch(url="/messages", {method: 'POST',
                        body: JSON.stringify({"channelName": document.getElementsByName("channelName")[0].value}))
                        .then(function json_2(response) {return resposne.json()})
                        .then(function(data_2) {
                            const message = data_2["messages"]
                            
                        })
                    }
                    newChannel.innerHTML = document.getElementsByName("channelName")[0].value;
                    myRoomsMenu.append(newChannel)

                    document.getElementsByName("channelName")[0].value = ""
                    // TODO: add onclick behaviour.
                } else {uniqueError.classList.remove("d-none")}
            }
        )
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

            // TODO: add onclick behaviour
        }
    })

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
        message_row.setAttribute("class", "row")
        console.log(message_html)
        message_row.innerHTML = message_html;
        const message_list = document.getElementById("message")
        message_list.appendChild(message_row)
    })

})