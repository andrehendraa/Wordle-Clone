from flask import Flask, request, jsonify, render_template
import logging
import random
import re

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)


with open("words.txt", "r") as f:
    word_list = f.read().strip().split(",")

@app.route('/')
def index():
    global SECRET_WORD
    SECRET_WORD = random.choice(word_list).strip()
    SECRET_WORD = re.sub(r"[^\x00-\x7F']", '', SECRET_WORD) 
    SECRET_WORD = SECRET_WORD.replace("'", "").upper()
    logging.debug(f"New SECRET_WORD: {SECRET_WORD}")

    return render_template('index.html')

@app.route('/new_word', methods=['GET'])
def new_word():
    global SECRET_WORD
    SECRET_WORD = random.choice(word_list).strip()
    SECRET_WORD = re.sub(r"[^\x00-\x7F']", '', SECRET_WORD)
    SECRET_WORD = SECRET_WORD.replace("'", "").upper()
    logging.debug(f"New SECRET_WORD: {SECRET_WORD}")
    
    return jsonify({"secret_word": SECRET_WORD})


@app.route('/check_word', methods=['POST'])
def check_word():
    try:
        data = request.get_json()
        logging.debug(f"Received data: {data}")
        guess = data.get('guess', '').upper()

        if not guess:
            return jsonify({"error": "Missing guess"}), 400

        if not re.match(r"^[a-zA-Z]{5}$", guess):
            return jsonify({"error": "Invalid guess format"}), 400

        result = []
        for i, letter in enumerate(guess):
            if letter == SECRET_WORD[i]:
                result.append('correct')
            elif letter in SECRET_WORD:
                result.append('present')
            else:
                result.append('absent')

        return jsonify({"result": result, "secret_word": SECRET_WORD})

    except Exception as e:
        logging.error(f"Error processing /check_word: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
