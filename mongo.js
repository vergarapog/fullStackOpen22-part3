const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  )
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://123qwe:${password}@cluster0.5rfhj.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

const Person = mongoose.model("Person", personSchema)

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then((result) => {
      console.log("connected")
      Person.find({}).then((result) => {
        result.forEach((person) => {
          console.log(person)
        })
        mongoose.connection.close()
      })
    })
    .then(() => {
      console.log("all persons collected")
      return
    })
    .catch((err) => {
      console.log(err)
    })
}

if (process.argv.length === 5) {
  mongoose
    .connect(url)
    .then((result) => {
      console.log("connected")
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })
      return person.save()
    })
    .then(() => {
      console.log("person saved!")
      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}
