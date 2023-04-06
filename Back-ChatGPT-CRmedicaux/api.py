from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

#Setting up Flask
app = Flask(__name__)
#Allow request from React
CORS(app)

#Enter your key of your OpenAI account. Go to https://platform.openai.com/account/api-keys to generate one if you don't have any.
#Pay attention, request to chatGPT can be limited. Upgrade to chatGPT plus for a unlimited access and more models.
openai.api_key = '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'

#Retrive datas from the form from the front and send it to ChatGPT. Model used is "gpt-3.5-turbo".
@app.route('/api/form', methods=['POST'])
def submit_form():
    form_data = request.get_json()
    text = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"user", "content":createPrompt(form_data)}]
    )
    
    ActualContent = jsonify(text["choices"][0]["message"]["content"])
    print(ActualContent.data)
    return jsonify(text["choices"][0]["message"]["content"])

#Create the prompt use to generate the discharge summary
def createPrompt (form_data):
    basePrompt="Make me the discharge summary of a anonym patient,"
    personalPronoun=""
    possessiveAdjective=""

    #Define the gender identity for a better and more natural prompt
    if form_data['sexe'] != "":
        if form_data['sexe'] == "female":
            personalPronoun="she"
            possessiveAdjective="her"
        else:
            personalPronoun="he"
            possessiveAdjective="his"
        basePrompt+=possessiveAdjective+" sex is "+form_data['sexe']
    else:
        possessiveAdjective="his"
        personalPronoun="he"
    
    #Create the prompt with data from the front
    #
    if form_data['ethnicity'] != "":
        basePrompt+=" "+possessiveAdjective+" ethnicity is "+form_data['ethnicity']
    if form_data['age'] != "":
        basePrompt+=" and "+possessiveAdjective+" age is "+form_data['age']+".\n"
    if form_data['entryDate'] != "":
        basePrompt+=possessiveAdjective+" entry date is "+form_data['entryDate']
    if form_data['exitDate'] != "":
        basePrompt+=" and "+possessiveAdjective+" exit date is "+form_data['exitDate']+".\n"
    if form_data['service'] != "":
        basePrompt+=personalPronoun+" was in this "+form_data['service']+" service."

    #Add the list of allergies in basePrompt with a loop 
    if form_data['allergies'] != "":
        basePrompt+=" "+possessiveAdjective+" allergies/allergy is/are "+form_data['allergies']
    
    #Add a problem or disease with specifique word to include in the discharge summary
    if len(form_data['checkedBoxes'][0]) > 0:
        for problem in form_data['checkedBoxes'][0]:
            basePrompt += " this discharge summary should contain this/these word(s): "
            for word in form_data['checkedBoxes'][1]:
                basePrompt += ", ".join(word)
            basePrompt += " for this problem: " + problem

    return basePrompt

@app.route('/api/updater', methods=['POST'])
def submit_update():
    form_update = request.get_json()
    print(CreateUpdatePrompt(form_update))
    text = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"user", "content":CreateUpdatePrompt(form_update)}]
    )
    return jsonify(text["choices"][0]["message"]["content"])

def CreateUpdatePrompt(form_update):
    updatePrompt = form_update[0]['text']+". There is the text that you should update: "+form_update[1]['text']
    return updatePrompt
    
if __name__ == '__main__':
    app.run(debug=True)
