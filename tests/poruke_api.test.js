const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const pomocni = require('./test_pomocni')

const api = supertest(app)

const Poruka = require('../models/poruka')
beforeEach(async () => {
  await Poruka.deleteMany({})

  for (let poruka of pomocni.pocetnePoruke) {
    let porukaObjekt = new Poruka(poruka)
    await porukaObjekt.save()
  }
})

test('poruke se vraćaju kao JSON', async () => {
  await api
    .get('/api/poruke')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('dohvaća sve poruke', async () => {
  const odgovor = await api.get('/api/poruke')
  expect(odgovor.body).toHaveLength(pomocni.pocetnePoruke.length)
})

test('specificni sadrzaj jedne poruke', async () => {
  const odgovor = await api.get('/api/poruke')
  const sadrzaj = odgovor.body.map(p => p.sadrzaj)
  expect(sadrzaj).toContain('React koristi JSX sintaksu')
})

test('dodavanje ispravne poruke', async () => {
  const novaPoruka = {
    sadrzaj: 'async/await olaksava asinkrone pozive',
    vazno: true
  }
  await api
    .post('/api/poruke')
    .send(novaPoruka)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const porukeNaKraju = await pomocni.porukeIzBaze()
  expect(porukeNaKraju).toHaveLength(pomocni.pocetnePoruke.length + 1)

  const sadrzaj = porukeNaKraju.map(p => p.sadrzaj)
  expect(sadrzaj).toContain('async/await olaksava asinkrone pozive')

})

test('dodavanje poruke bez sadrzaja', async () => {
  const novaPoruka = {
    vazno: true
  }
  await api
    .post('/api/poruke')
    .send(novaPoruka)
    .expect(400)

  const porukeNaKraju = await pomocni.porukeIzBaze()
  expect(porukeNaKraju).toHaveLength(pomocni.pocetnePoruke.length)

})

test('dohvat specificne poruke', async () => {
  const porukePocetak = await pomocni.porukeIzBaze()
  const trazenaPoruka = porukePocetak[0]

  const odgovor = await api
    .get(`/api/poruke/${trazenaPoruka.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const jsonPoruka = JSON.parse(JSON.stringify(trazenaPoruka))
  expect(odgovor.body).toEqual(jsonPoruka)
})

test('ispravno brisanje poruke', async () => {
  const porukePocetak = await pomocni.porukeIzBaze()
  const porukaZaBrisanje = porukePocetak[0]

  const odgovor = await api
    .delete(`/api/poruke/${porukaZaBrisanje.id}`)
    .expect(204)

  const porukeKraj = await pomocni.porukeIzBaze()
  expect(porukeKraj).toHaveLength(porukePocetak.length - 1)

  const sadrzaj = porukeKraj.map(p => p.sadrzaj)
  expect(sadrzaj).not.toContain(porukaZaBrisanje.sadrzaj)

})

afterAll(async () => {
  await mongoose.connection.close()
})