import time
import json
import secrets

import flask
import flask_cors


app = flask.Flask(__name__)
flask_cors.CORS(app, resources={r"/*": {"origins": "*"}})
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024


# TODO: You MUST use a database to avoid race condition / keep data, and I suggest MongoDB
fake_database = dict({
    "user": list([
        dict({
            "username": "admin",
            "password": "admin",
            "token": "7294c10c315fb1c3",
            "friend_list": list([
                "henrychao"
            ])
        }),
        dict({
            "username": "henrychao",
            "password": "henry0718",
            "token": "82504762dff1f910",
            "friend_list": list([
                "admin",
                "tata0523"
            ])
        }),
        dict({
            "username": "tata0523",
            "password": "tata0523",
            "token": "b1ab1dd2d241b2ce",
            "friend_list": list([
                "henrychao"
            ])
        })
    ]),
    "history": dict({
        "admin": dict({
            "henrychao": list()
        }),
        "henrychao": dict({
            "admin": list(),
            "tata0523": list([
                dict({
                    "id": "9626c806e471e33ea21c746478fc9c46",
                    "sender_name": "tata0523",
                    "timestamp": 1642010705847,
                    "content": "Hello world",
                    "type": "Generic"
                }),
                dict({
                    "id": "39754471940354f3f652f7c935650c6e",
                    "sender_name": "henrychao",
                    "timestamp": 1642011031020,
                    "content": "???",
                    "type": "Generic"
                })
            ])
        }),
        "tata0523": dict({
            "henrychao": list([
                dict({
                    "id": "dffad5831fe6a1a8a59791a8d16d7149",
                    "sender_name": "tata0523",
                    "timestamp": 1642010705847,
                    "content": "Hello world",
                    "type": "Generic"
                }),
                dict({
                    "id": "bccd660464b1970d1db6a3749a1f77f4",
                    "sender_name": "henrychao",
                    "timestamp": 1642011031020,
                    "content": "???",
                    "type": "Generic"
                })
            ])
        })
    })
})


@app.route("/", methods=["POST"])
def hello():
    return "Hello, World!"


@app.route("/put/account", methods=["POST"])
def put_account():
    data = json.loads(flask.request.data)
    username = data["username"]
    password = data["password"]
    for user_info in fake_database["user"]:
        if username == user_info["username"]:
            return flask.jsonify({
                "status": "dup"
            })
    fake_database["user"].append(dict({
        "username": username,
        "password": password,
        "token": secrets.token_hex(8),
        "friend_list": list()
    }))
    fake_database["history"][username] = dict()
    return flask.jsonify({
        "status": "ok"
    })


@app.route("/get/account", methods=["POST"])
def get_account():
    data = json.loads(flask.request.data)
    username = data["username"]
    password = data["password"]
    for user_info in fake_database["user"]:
        if username == user_info["username"] and \
            password == user_info["password"]:
            return flask.jsonify({
                "status": "ok",
                "payload": user_info["token"]
            })
    return flask.jsonify({ "status": "error" })


@app.route("/put/friends", methods=["POST"])
def put_friends():
    data = json.loads(flask.request.data)
    token = data["token"]
    target = data["target"]
    for user_info in fake_database["user"]:
        if token == user_info["token"]:
            print("token correct")
            # token is correct
            for user in fake_database["user"]:
                if target == user["username"]:
                    # target exists
                    if target not in user_info["friend_list"]:
                        # target hasnt been friend
                        user_info["friend_list"].append(target)
                        fake_database["history"][user_info["username"]][target] = list()
                        return flask.jsonify({
                            "status": "ok"
                        })
                    else:
                        return flask.jsonify({
                            "status": "dup"
                        })
            return flask.jsonify({
                "status": "not_found"
            })
    return flask.jsonify({
        "status": "error"
    })


@app.route("/del/friends", methods=["POST"])
def del_friends():
    data = json.loads(flask.request.data)
    token = data["token"]
    target = data["target"]
    for user_info in fake_database["user"]:
        if token == user_info["token"]:
            print("token correct")
            # token is correct
            user_info["friend_list"].remove(target)
            fake_database["history"][user_info["username"]].pop(target)
            return flask.jsonify({
                "status": "ok"
            })
    return flask.jsonify({
        "status": "error"
    })


@app.route("/get/friends", methods=["POST"])
def get_friends():
    data = json.loads(flask.request.data)
    token = data["token"]
    for user_info in fake_database["user"]:
        if token == user_info["token"]:
            return flask.jsonify({
                "status": "ok",
                "payload": user_info["friend_list"]
            })
    return flask.jsonify({ "status": "error" })


def _search_history_from_token(token: str):
    for user_info in fake_database["user"]:
        if token == user_info["token"]:
            return user_info["username"], fake_database["history"][user_info["username"]]
    return None


def _search_history_from_target(target: str):
    for user_name in fake_database["history"]:
        if user_name == target:
            return fake_database["history"][user_name]


@app.route("/get/messages", methods=["POST"])
def get_messages():
    data = json.loads(flask.request.data)
    token = data["token"]
    target = data["target"]
    _, all_history = _search_history_from_token(token)
    if all_history:
        return flask.jsonify({
            "status": "ok",
            "payload": all_history[target]
        })
    return flask.jsonify({ "status": "error" })


@app.route("/put/messages", methods=["POST"])
def put_messages():
    data = json.loads(flask.request.data)
    token = data["token"]
    target = data["target"]
    message = data["message"]
    type_ = data["type"]

    username, all_history = _search_history_from_token(token)
    if all_history:
        new_obj = dict({
            "id": secrets.token_hex(16),
            "sender_name": username,
            "timestamp": int(time.time() * 1000),
            "content": message,
            "type": type_
        })

        # self
        all_history[target].append(new_obj)

        # opposite
        target_person_history = _search_history_from_target(target)
        if username in target_person_history:
            # its possible counterpart hasnt added username yet
            target_person_history[username].append(new_obj)

        return flask.jsonify({ "status": "ok" })

    return flask.jsonify({ "status": "error" })


@app.route("/del/messages", methods=["POST"])
def del_messages():
    data = json.loads(flask.request.data)
    token = data["token"]
    target = data["target"]
    id = data["id"]
    username, all_history = _search_history_from_token(token)
    if all_history:
        # self
        for i in range(len(all_history[target])):
            if id == all_history[target][i]["id"]:
                all_history[target].pop(i)
                break
        # opposite
        target_person_history = _search_history_from_target(target)
        if username in target_person_history:
            for i in range(len(target_person_history[username])):
                if id == target_person_history[username][i]["id"]:
                    target_person_history[username].pop(i)
                    break
        return flask.jsonify({ "status": "ok" })
    return flask.jsonify({ "status": "error" })


def _main() -> None:
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    _main()