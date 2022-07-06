const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

morgan.token("postData", (req, res) => {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
)
app.use(cors())
app.use(express.static("build"))

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

app.get("/api/phonebook", (request, response) => {
  response.json(phonebook)
})

app.get("/api/phonebook/:id", (request, response) => {
  const id = Number(request.params.id)
  const data = phonebook.find((curr) => {
    return curr.id === id
  })
  if (data) {
    response.json(data)
  } else {
    response.status(404).end()
  }
})

app.post("/api/phonebook", (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    })
  }

  let allNames = phonebook.reduce((accu, curr) => {
    return [...accu, curr.name]
  }, [])

  if (allNames.includes(body.name)) {
    return response.status(400).json({
      error: "name already exists in phonebook",
    })
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  phonebook = phonebook.concat(newPerson)
  response.json(newPerson)
})

app.delete("/api/phonebook/:id", (request, response) => {
  const id = Number(request.params.id)
  phonebook = phonebook.filter((curr) => {
    return curr.id !== id
  })
  response.status(204).end()
})

app.get("/api/info", (request, response) => {
  const entryCount = phonebook.length
  const date = new Date()
  response.send(
    `<p>Phonebook has info for ${entryCount} people</p><br><p>${date}</p>`
  )
})

const generateId = () => {
  return Math.floor(Math.random() * 10000 + 1)
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
