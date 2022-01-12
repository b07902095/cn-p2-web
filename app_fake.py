import flask


app = flask.Flask(__name__)


@app.route("/", methods=["POST"])
def hello():
    return "Hello, World!"


def _main() -> None:
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    _main()