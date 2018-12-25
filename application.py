from flask import Flask, render_template, url_for, request, session, jsonify, json

from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = "74561..834.51.835048.5867"
socketio = SocketIO(app)

Users = dict({})
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
    return render_template("chat.html", Username=User, data=messages, rooms=Users_to_rooms[User])

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
    channelName = json.loads(request.data)["channelName"]
    messages_list = Rooms_to_messages[channelName]
    return jsonify(messages_list)

@socketio.on("message_sent")
def handle_message(data):
    print(data)
    messages.append(data)
    emit("message_received", data, broadcast="True")

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

@socketio.on("join")
def join(data):
    room = data.Room
    username = data.Username
    print(room, username)
    join_room(room)
    Rooms[username] = room

@app.route("/logout")
def logout():
    session["logged_in"] = False
    session["User"] = None
    return entry()

if __name__ == "__main__":
    socketio.run(app)