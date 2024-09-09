# WORDLE GAME ALOGORITHM
import random
import re

with open("words.txt", "r") as f:
    word_list = f.read().strip().split(",")

def check_word():
    hidden_word = random.choice(word_list).strip()
    hidden_word = re.sub(r"[^\x00-\x7F']", '', hidden_word) 
    hidden_word = hidden_word.replace("'", "")

    attempts = 6
    pattern = r"^[a-zA-Z]{5}$"
    
    while attempts > 0:
        guess = input("Guess the word (5 letters): ").lower()

        if not re.match(pattern, guess):
            print("Please enter a valid 5-letter word.\n")
            continue

        if guess == hidden_word:
            print("You guessed the word correctly! WIN")
            break

        feedback = ""
   
        for i in range(0,5):
            if guess[i] == hidden_word[i]:
                feedback += "green "
            elif guess[i] in hidden_word:
                feedback += "yellow "
            else:
                feedback += "grey "

        print(feedback.strip())

        attempts -= 1
        print(f"\nYou have {attempts} attempt(s) left.")

        if attempts == 0:
            print("Game over!!!!")
            print(f"The hidden word was '{hidden_word}'.")

check_word()
