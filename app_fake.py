import flask
import flask_cors


app = flask.Flask(__name__)
flask_cors.CORS(app, resources={r"/*": {"origins": "*"}})
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024


@app.route("/", methods=["POST"])
def hello():
    return "Hello, World!"


@app.route("/get/friends", methods=["POST"])
def get_friends():
    # TODO
    return flask.jsonify({
        "status": "ok",
        "payload": list(("Henry", "Tata", "123", "456", "789"))
    }) 


def _main() -> None:
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    _main()