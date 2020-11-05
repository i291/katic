const porukeRouter = require('express').Router()
const Poruka = require('../models/poruka')
const Korisnik = require('../models/korisnik')
const jwt = require('jsonwebtoken')

porukeRouter.get('/', async (req, res) => {
  const poruke = await Poruka.find({})
    .populate('korisnik', { username: 1, ime: 1 })
  res.json(poruke)

})

porukeRouter.get('/:id', async (req, res) => {
  const poruka = await Poruka.findById(req.params.id)
  if (poruka) {
    res.json(poruka)
  } else {
    res.status(404).end()
  }
})
const dohvatiToken = req => {
  const auth =req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer')){
    return auth.substring(7)
  }
  return null
}
porukeRouter.delete('/:id', async (req, res) => {

//id poruke
  const id = req.params.id
  const token = dohvatiToken(req)
  const dekToken = jwt.verify(token, process.env.SECRET)
  const korisnik = await Korisnik.findById(dekToken.id)
  if(!token || !dekToken.id || !(korisnik.poruke.includes(id))){
    return res.status(401).end()

  }
  
  await Poruka.findByIdAndRemove(req.params.id)

  res.status(204).end() 
  

 
})

 porukeRouter.put('/:id',async(req,res)=>{
   const podatak=req.body
   const id = req.params.id
   const token = dohvatiToken(req)
   const dekToken = jwt.verify(token, process.env.SECRET)
   const korisnik = await Korisnik.findById(dekToken.id)
   if(!token || !dekToken.id || !(korisnik.populate.includes(res.params.id))){
    return res.status(401).end()

  }
  const poruka={
    sadrzaj:podatak.sadrzaj,
    vazno:podatak.vazno

  }
  const novaPoruka=await Poruka.findByIdAndUpdate(id,poruka,{new:true})
  res.json(novaPoruka)

 })



porukeRouter.post('/', async (req, res, next) => {
  const podatak = req.body
  const token = dohvatiToken(req)
  const dekToken = jwt.verify(token, process.env.SECRET)
  if (!token || !dekToken.id){
    
    return res.status(401).json({error: 'neispravni ili nepostojeći token'})
  }
  const korisnik = await Korisnik.findById(dekToken.id)

  const poruka = new Poruka({
    sadrzaj: podatak.sadrzaj,
    vazno: podatak.vazno || false,
    datum: new Date(),
    korisnik: korisnik._id
  })
  const spremljenaPoruka = await poruka.save()
  korisnik.poruke = korisnik.poruke.concat(spremljenaPoruka._id)
  await korisnik.save()

  res.json(spremljenaPoruka)
})

module.exports = porukeRouter