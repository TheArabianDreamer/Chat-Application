from flask import Flask, render_template, url_for, request, session

from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = "74561..834.51.835048.5867"
socketio = SocketIO(app)

Users = dict({})
messages = []

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
    return render_template("chat.html", Username=User, data=messages)

@socketio.on("message_sent")
def handle_message(data):
    print(data)
    messages.append(data)
    emit("message_received", data, broadcast="True")

@app.route("/logout")
def logout():
    session["logged_in"] = False
    session["User"] = None
    return entry()

if __name__ == "__main__":
    socketio.run(app)