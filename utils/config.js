require('dotenv').config()
const PORT = process.env.PORT

// Baza podataka
const password = process.env.ATLAS_PASS

const dbname = process.env.NODE_ENV === 'test'
? 'poruke-api-test2'
: 'porukeapi2'


const DB_URI = `mongodb://ivanaradalj-okviri:${password}@cluster0-shard-00-00.vqn5c.mongodb.net:27017,cluster0-shard-00-01.vqn5c.mongodb.net:27017,cluster0-shard-00-02.vqn5c.mongodb.net:27017/${dbname}?ssl=true&replicaSet=atlas-vwst3l-shard-0&authSource=admin&retryWrites=true&w=majority`

module.exports = {PORT, DB_URI}
