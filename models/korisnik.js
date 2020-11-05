const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const korisnikSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
        
    },
    ime: String,
    passHash: String,
    poruke : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poruka'
        }
    ],
})

korisnikSchema.plugin(uniqueValidator)

korisnikSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        // Lozinka se ne bi trebala prikazati
        delete ret.passHash
        return ret
    }
})

const Korisnik = mongoose.model('Korisnik', korisnikSchema, 'korisnici')

module.exports = Korisnik