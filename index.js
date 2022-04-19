const express = require('express');
const PORT = 3001;
const app = express();
const morgan = require('morgan')

app.use(express.json());

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  }))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

function getId(){
    return Math.round(Math.random() * 10000000);
}

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/info', (req, res) => {
    let currentTime = new Date();
    let pbLength = persons.length;
    res.send(`The phonebook has entries for ${pbLength} people.` 
            + ` ${currentTime}`)
});

app.get('/api/persons/:id', (req, res) => {
    let personReq = req.params.id;
    let personRes = persons.find(x => x.id === Number(personReq));

    if(personRes){
        res.json(personRes);
    } else {
        res.status(404);
        res.end();
    }
})

app.delete('/api/persons/:id', (req, res) => {
    let deleteReq = Number(req.params.id);
    let ids = persons.map(x => x = x.id);
    if(ids.includes(deleteReq)){
        persons = persons.filter(x => x.id !== deleteReq);
        res.status(204);
        res.end();
    } else {
        res.status(204)
        res.end();
    }
})

class PhonebookEntry{
    constructor(id, name, number){
        this.id = id
        this.name = name
        this.number = number
    }
}

app.post('/api/persons', (req, res) => {
    let entryBody = req.body;
    let currentNames = persons.map(x => x = x.name);
    let currentNums = persons.map(x => x = x.number);
    morgan.token('body', (req, res) => { return entryBody});

    if (!entryBody){
        return res.status(404).json({error: "New entry cannot be blank"});
    } else if (currentNames.includes(entryBody.name)){
        return res.status(404).json({error: `Entry named ${entryBody.name} already exists!`});
    } else if (currentNums.includes(entryBody.number)){
        let matchNum = persons.filter(x => x.number == entryBody.number);
        return res.status(404).json({error: `${matchNum[0].name} already registered with number ${matchNum[0].number}`});
    }else {
        let entryId = getId();
        let entryName = entryBody.name;
        let entryNum = entryBody.number;

        let newEntry = new PhonebookEntry(entryId, entryName, entryNum);
        persons.push(newEntry);
        res.status(200);
        res.json(newEntry);
    }
    
})

app.listen(PORT, () => {
    console.log(`Server now running on Port ${PORT}`)
});