const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');

const app = express()
const port = 3000

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'docker'
}) 

app.use(bodyParser.urlencoded({ extended: true }))

connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack)
      return
    }
    console.log('Connected to the database as id', connection.threadId)
  })

  app.get('/', (req, res) => {
    const query = 'SELECT * FROM notes'
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err)
        res.status(500).send('Error fetching notes')
      } else {
        // Construire le HTML avec les notes
        const notesList = results.map(note => `<li>Title: ${note.title}, Description: ${note.description}</li>
        <form action="/delete" method="post">
                <input type="hidden" name="id" value="${note.id}">
                <input type="submit" value="Supprimer">
            </form>
        `).join('')
        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notes</title>
          </head>
          <body>
            <main>
              <h1 class="title">Mes notes</h1>
              <form action="/" method="post">
                <input type="text" placeholder="Titre" name="title">
                <input type="text" placeholder="Description" name="description">
                <input type="submit">
              </form>
              <ul id="list">
                ${notesList}
              </ul>
            </main>
          </body>
          </html>
        `
        res.send(html)
      }
    })
  })

app.post('/', (req, res) => {
    console.log("req", req.body)
    const { title, description } = req.body
    const query = 'INSERT INTO notes (title, description) VALUES (?, ?)'
    
    connection.query(query, [title, description], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error saving the note')
        } else {
            console.log('Note saved successfully', result)
            res.redirect('/')
        }
    })
})

app.post('/delete', (req, res) => {
    const { id } = req.body
    const query = 'DELETE FROM notes WHERE id = ?'
    
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error deleting the note')
        } else {
            console.log('Note deleted successfully', result)
            res.redirect('/')
        }
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
