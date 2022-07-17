require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")

morgan.token("postData", (req) => {
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

// MONGODB FUNCS///////////////
const Person = require("./models/phonebook")

// END MONGODB FUNCS///////////////

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
  Person.find({}).then((res) => {
    response.json(res)
  })
})

app.get("/api/phonebook/:id", (request, response, next) => {
  // const id = Number(request.params.id)
  // const data = phonebook.find((curr) => {
  //   return curr.id === id
  // })
  // if (data) {
  //   response.json(data)
  // } else {
  //   response.status(404).end()
  // }
  Person.findById(request.params.id)
    .then((res) => {
      if (res) {
        response.json(res)
      } else {
        response.status(404).end()
      }
    })
    .catch((err) => {
      next(err)
    })
})

app.post("/api/phonebook", (request, response, next) => {
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
  //  DUPLICATE NAME FEATURE, Disabled for now
  // let allNames = phonebook.reduce((accu, curr) => {
  //   return [...accu, curr.name]
  // }, [])

  // if (allNames.includes(body.name)) {
  //   return response.status(400).json({
  //     error: "name already exists in phonebook",
  //   })
  // }
  // Person.findOne({ name: body.name }).then((res) => {
  //   if (res) {
  //     return response.status(400).json({
  //       error: `${body.name} already exists in phonebook`,
  //     })
  //   }
  // })

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((err) => next(err))
})

app.put("/api/phonebook/:id", (request, response) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((res) => {
      response.json(res)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.delete("/api/phonebook/:id", (request, response) => {
  // const id = Number(request.params.id)
  // phonebook = phonebook.filter((curr) => {
  //   return curr.id !== id
  // })
  // response.status(204).end()
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((err) => {
      console.log(err)
    })
})

app.get("/api/info", (request, response) => {
  const entryCount = phonebook.length
  const date = new Date()
  response.send(
    `<p>Phonebook has info for ${entryCount} people</p><br><p>${date}</p>`
  )
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.log(error.name)
  console.log(error.message)

  if (error.name === "CastError") {
    response.status(400).json({ error: "malformatted id" })
  }
  if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message })
  }
  if (error.name === "MongoServerError") {
    response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)
