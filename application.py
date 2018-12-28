from flask import Flask, render_template, url_for, request, session, jsonify, json

from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = "74561..834.51.835048.5867"
socketio = SocketIO(app)

Users = dict({})
Users_to_active = dict({})
Users_to_rooms = dict({})
Rooms_to_messages = dict({})
messages = []
Rooms = []

@app.route("/")
def entry():
    if session.get("logged_in"):
        return chat()
    else:
        return render_template("logon.html")

@app.route("/login", methods=["POST"])
def login():
    Username = request.form["Username"]
    Password = request.form["Password"]
    Typeoflog = request.form["Typeoflog"]

    """
    I'm not happy about this validation. 
    #TODO: Would like to abstract this further.
    """
    if Typeoflog == "login":
        if Username in Users:
            if Users.get(Username) == Password:
                session["logged_in"] = True
                session["User"] = Username
                return chat()
            else:
                error = "Incorrect Password"
        else:
            error = "Incorrect Username"
    else:
        if Username != "" and Password != "":
            if not Users.get(Username):
                Users[Username] = Password
                Users_to_rooms[Username] = []
                Users_to_active[Username] = None
                session["logged_in"] = True
                session["User"] = Username
                return chat()
            else:
                error = "Username Already Exists"
        else:
            error = "Please Complete the form"
    return render_template("logon.html", error=error)

@app.route("/chat", methods=["POST"])
def chat():
    User = session["User"]
    print("Is User in Room? ", Users_to_active[User] != None)
    print("which room? ", Users_to_active[User])
    if Users_to_active[User] != None:
        myRoom = Users_to_active[User]
        myRoomMessages = Rooms_to_messages[myRoom]
        print(myRoom)
    else:
        myRoom = None
        myRoomMessages = []
    return render_template("chat.html", Username=User, myRoom=myRoom, messages=myRoomMessages, rooms=Users_to_rooms[User], join_rooms=[room for room in Rooms if room not in Users_to_rooms[User]])

@app.route("/create", methods=["POST"])
def create():
    User = session["User"]
    #print("request form: ", request.data) Weird Request.data object in bytes
    room = json.loads(request.data)["channelName"]
    success = room not in Rooms
    return jsonify({"success": success})

@app.route("/messages", methods=["POST"])
def __messages():
    User = session["User"]
    print(json.loads(request.data))
    channelName = json.loads(request.data)["channelName"]
    #join_room(channelName)  Instead, make a socket emit after the /messages call. Can't do socket functions in a view function.
    print(Rooms_to_messages)
    messages_list = Rooms_to_messages[channelName]
    print(jsonify(messages_list))
    return jsonify(messages_list)

@app.route("/join", methods=["POST"])
def include():
    data = json.loads(request.data)
    room = data["channelName"]
    User = session["User"]
    Users_to_rooms[User].append(room)
    return jsonify({"success": True})

@socketio.on("channel_opened")
def channel_opened(data):
    print("rougue channel_opened data: ", data)
    room = data["channelName"]
    username = session["User"]
    if Users_to_active[username] != None:
        leave_room(Users_to_active[username])
    print(room, username)
    join_room(room)
    Users_to_active[username] = room
    

@socketio.on("message_sent")
def handle_message(data):
    print(data)
    room = Users_to_active[session["User"]]
    Rooms_to_messages[room].append(data)
    emit("message_received", data, broadcast="True", room=Users_to_active[session["User"]])

@socketio.on("channel_created")
def handle_creation(data):
    print(data)
    room = data["channelName"]
    User = session["User"]
    Rooms.append(room)
    Users_to_rooms[User].append(room)
    Rooms_to_messages[room] = []
    print(Users_to_rooms)
    emit("channel_was_created", {"channelName": data["channelName"], "User": User}, broadcast=True)


@app.route("/logout")
def logout():
    session["logged_in"] = False
    session["User"] = None
    return entry()

if __name__ == "__main__":
    socketio.run(app)