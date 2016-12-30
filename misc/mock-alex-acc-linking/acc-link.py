#!/usr/local/bin/python
import logging
from random import randint
from flask import Flask, render_template
from flask_ask import Ask, statement, question, session, request
import requests

# amzn1.ask.skill.adac502f-26dd-4a97-a01d-cd2a65522c02
app = Flask(__name__)
ask = Ask(app, "/")
logging.getLogger("flask_ask").setLevel(logging.DEBUG)
amznProfileURL = 'https://api.amazon.com/user/profile?access_token='

@ask.launch
def new_game():
    welcome_msg = render_template('welcome')
    print request.timestamp
    if session.user.accessToken is None:
        speech_text = "To use this skill please use Alexa companion app to authenticate on Amazon"
        return statement(speech_text).link_account_card()

    else:
        print "----"
        print session.user.accessToken

        url = "%s%s" %(amznProfileURL,session.user.accessToken)
        print url
        r = requests.get(url)
        print "-----------"
        print r.content
        """
        response = requests.request("GET", url)

        print response.text
        """
        return question(welcome_msg)


@ask.intent("YesIntent")
def next_round():
    numbers = [randint(0, 9) for _ in range(3)]
    round_msg = render_template('round', numbers=numbers)
    session.attributes['numbers'] = numbers[::-1]  # reverse
    return question(round_msg)


@ask.intent("AnswerIntent", convert={'first': int, 'second': int, 'third': int})
def answer(first, second, third):
    winning_numbers = session.attributes['numbers']
    if [first, second, third] == winning_numbers:
        msg = render_template('win')
    else:
        msg = render_template('lose')
    return statement(msg)


if __name__ == '__main__':
    app.run(debug=True)
