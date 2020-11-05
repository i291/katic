const bcrypt = require('bcrypt')
const Korisnik = require('../models/korisnik')
const pomocni = require('./test_pomocni')

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Korisnik.deleteMany({})

  const passHash = await bcrypt.hash('tajna', 10)
  const korisnik = new Korisnik({username: 'admin', passHash})

  await korisnik.save()
})

describe('Kada imamo samo jednog korisnika u bazi', () =>{
  test('stvara se novi korisnik sa ispravnim username', async () =>{
    const pocetniKorisnici = await pomocni.korisniciUBazi()

    const novi = {
      username: 'gzaharija',
      ime: 'Goran Zaharija',
      pass: 'oarwa'
    }

    await api
    .post('/api/korisnici')
    .send(novi)
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const korisniciKraj = await pomocni.korisniciUBazi()
    expect(korisniciKraj).toHaveLength(pocetniKorisnici.length + 1)

    const korImena = korisniciKraj.map(u => u.username)
    expect(korImena).toContain(novi.username)
  }) 

  test('ispravno vraca pogresku ako vec postoji username', async () =>{
    const pocetniKorisnici = await pomocni.korisniciUBazi()

    const novi = {
      username: 'admin',
      ime: 'Goran Zaharija',
      pass: 'oarwa'
    }

    const rezultat = await api
    .post('/api/korisnici')
    .send(novi)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    expect(rezultat.body.error).toContain('`username` to be unique')

    const korisniciKraj = await pomocni.korisniciUBazi()
    expect(korisniciKraj).toHaveLength(pocetniKorisnici.length)
  })
})
afterAll(async () => {
  await mongoose.connection.close()
})