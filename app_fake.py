import os
import cv2
import time
import copy
import json
import secrets
import tempfile

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
                }),
                # dict({
                #     "id": "3295444d9dde8f54ea6d1ab930d9019e",
                #     "sender_name": "tata0523",
                #     "timestamp": 1642165634784,
                #     "content": "/tmp/.cnp2/henrychao/tata0523/pig.png_3295444d9dde8f54ea6d1ab930d9019e",
                #     "type": "Image"
                # })
            ])
        }),
        "tata0523": dict({
            "henrychao": list([
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
                }),
                # dict({
                #     "id": "3295444d9dde8f54ea6d1ab930d9019e",
                #     "sender_name": "tata0523",
                #     "timestamp": 1642165634784,
                #     "content": "/tmp/.cnp2/tata0523/henrychao/pig.png_3295444d9dde8f54ea6d1ab930d9019e",
                #     "type": "Image"
                # })
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
        ret = copy.deepcopy(all_history[target])
        for i in range(len(ret)):
            if ret[i]["type"] == "Image" or ret[i]["type"] == "File":
                ret[i]["content"] = os.path.basename(
                    ret[i]["content"].replace("_{}".format(ret[i]["id"]), "")
                )
        return flask.jsonify({
            "status": "ok",
            "payload": ret
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


def _save_and_try_resize(file_storage, file_path, max_size=480) -> None:
    file_storage.save(file_path)
    try:
        image = cv2.imread(file_path)
        ratio = max(image.shape[0] / max_size, image.shape[1] / max_size)
        image = cv2.resize(image, (int(image.shape[1] / ratio), int(image.shape[0] / ratio)))
        cv2.imwrite(file_path, image)
    except:
        pass


@app.route("/put/messages/file", methods=["POST"])
def put_messages_file():
    data = flask.request.form
    token = data["token"]
    target = data["target"]
    message = data["message"]
    type_ = data["type"]

    file_ = flask.request.files["attachment"]

    username, all_history = _search_history_from_token(token)
    if all_history:
        global fs_root
        radomized_id = secrets.token_hex(16)
        saved_path = os.path.join(fs_root, username, target, "{}_{}".format(message, radomized_id))
        new_obj = dict({
            "id": radomized_id,
            "sender_name": username,
            "timestamp": int(time.time() * 1000),
            "content": saved_path,
            "type": type_
        })

        # self
        all_history[target].append(copy.deepcopy(new_obj))
        _save_and_try_resize(file_, saved_path)

        # opposite
        target_person_history = _search_history_from_target(target)
        if username in target_person_history:
            # its possible counterpart hasnt added username yet
            target_person_history[username].append(copy.deepcopy(new_obj))

        return flask.jsonify({ "status": "ok" })

    return flask.jsonify({ "status": "error" })


@app.route("/get/messages/file", methods=["POST"])
def get_messages_file():
    data = json.loads(flask.request.data)
    token = data["token"]
    target = data["target"]
    id = data["id"]
    _, all_history = _search_history_from_token(token)
    if all_history:
        for i in range(len(all_history[target])):
            if id == all_history[target][i]["id"]:
                return flask.send_file(
                    all_history[target][i]["content"],
                    download_name=os.path.basename(
                        all_history[target][i]["content"].replace(
                            "_{}".format(all_history[target][i]["id"]), ""
                        )
                    ),
                    as_attachment=True
                )
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
                if all_history[target][i]["type"] == "Image" or \
                    all_history[target][i]["type"] == "File":
                    os.remove(all_history[target][i]["content"])
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


def _init_filesystem() -> None:
    global fs_root
    fs_root = os.path.join(tempfile.gettempdir(), ".cnp2")
    os.makedirs(fs_root, exist_ok=True)
    for user in fake_database["user"]:
        os.makedirs(os.path.join(fs_root, user["username"]), exist_ok=True)
        for friend in user["friend_list"]:
            os.makedirs(os.path.join(fs_root, user["username"], friend), exist_ok=True)


def _main() -> None:
    _init_filesystem()
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    _main()