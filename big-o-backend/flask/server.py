#!/usr/bin/env python3
from flask import Flask
from flask import request

import json

app = Flask(__name__)


@app.route('/bigO/algorithm', methods=['POST'])
def post_algorithm():
    """ Takes an algorithm and returns its Time and Space Complexity """
    try:
        request_json = request.get_json()
        result = json.dumps([])
        response = app.response_class(
            response=result,
            status=200,
            mimetype='application/json')
    except ValueError as e:
        response = app.response_class(
            status=400,
            response=str(e)
        )
    return response


if __name__ == "__main__":
    app.run()
