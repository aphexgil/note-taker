const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received to get notes`);
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send(JSON.parse(data));
        });
});

app.post('/api/notes', (req,res) => {
    console.info(`${req.method} request received to save a new note.`);

    const { title, text } = req.body;

    if(title && text){

        const note = {
            "title": title,
            "text": text,
            "id": uniqid()
        }

        var noteArray = [];

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            noteArray = JSON.parse(data);
            noteArray.push(note);
            fs.writeFile('./db/db.json', JSON.stringify(noteArray), (err) =>
                err
                ? console.error(err)
                : console.log(`New note has been written to JSON file`)
            );
            
        });

        const response = {
            status: 'success',
            body: note
        };
        res.status(201).json(response);

  } else {
        res.status(500).json('Error in posting note');
  }
});

app.delete('/api/notes/:id', (req,res) => {

    const { id } = req.params;

    console.info(`${req.method} request received to delete note with id ${id}.`);

    if(id){

        var noteArray = [];

        fs.readFile('./db/db.json', 'utf8', (err, data) => {

            if (err) {
                console.error(err);
                return;
            }

            noteArray = JSON.parse(data);

            for(var i=0; i<noteArray.length; i++){
                if(noteArray[i].id==id){
                    noteArray.splice(i,1);
                    break;
                }
            }

            fs.writeFile('./db/db.json', JSON.stringify(noteArray), (err) =>
                err
                ? console.error(err)
                : console.log(`Note with id:${id} has been deleted from JSON file`)
            );
            
        });

        const response = {
            status: 'success',
            body: id
        };
        res.status(201).json(response);

  } else {
        res.status(500).json('Error in posting note');
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);