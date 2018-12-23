$(() => {
    const message_template = Handlebars.compile(document.getElementById("message-template").innerHTML)

    const socket = io();
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

    const joinRoom_button = document.querySelector(".join")
    const room_list = document.querySelector("#RoomList")
    joinRoom_button.onclick = () => {
        if (room_list.classList.contains("d-hidden")) { room_list.classList.remove("d-hidden") } else { room_list.classList.add("d-hidden") }
    }

    rooms = room_list.children
    for (var i=0; i<rooms.length; i++) {
        rooms[i].onclick = () => {
            socket.emit("join", {"Username": message_form.children[0].value, "Room": rooms[i].text})
        }
    }
})