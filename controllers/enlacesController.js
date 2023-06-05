const Enlaces = require('../models/Enlaces')
const shortid = require('shortid')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

exports.nuevoEnlace = async (req, res, next) => {
   const errores = validationResult(req)
   if(!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() })
   }

   const { nombre_original, nombre } =req.body;

   const enlace = new Enlaces()
   enlace.url = shortid.generate()
   enlace.nombre = nombre
   enlace.nombre_original = nombre_original
   
   if(req.usuario) {
      const { password, descargas } = req.body
      if(descargas) {
         enlace.descargas = descargas
      }
      if(password) {
         const salt = await bcrypt.genSalt(10)
         enlace.password = await bcrypt.hash(password, salt)
      }
      enlace.autor = req.usuario.id
   }

   try {
      await enlace.save()
      return res.json({ msg: `${enlace.url}`})
   } catch (error) {
      console.log(error);
   }
}

exports.todosEnlaces = async (req, res) => {
   try {
      const enlaces = await Enlaces.find({}).select('url -_id')
      res.json({ enlaces })
   } catch (error) {
      console.log(error);
   }
}

exports.tienePassword = async (req, res, next) => {
   const { url } = req.params
   const enlace = await Enlaces.findOne({ url })

   if(!enlace) {
      res.status(404).json({ msg: 'Ese enlace no existe' })
      return next()
   }

   if(enlace.password) {
      return res.json({ password: true, enlace: enlace.url })
   }
   next()
}

exports.verificarPassword = async (req, res, next) => {
   const { url } = req.params
   const { password } = req.body

   const enlace = await Enlaces.findOne({ url })

   if(bcrypt.compareSync( password, enlace.password )) {
      next()
   } else {
      return res.status(401).json({ msg: 'Password Incorrecto' })
   }
}

exports.obtenerEnlace = async (req, res, next) => {
   const { url } = req.params
   const enlace = await Enlaces.findOne({ url })

   if(!enlace) {
      res.status(404).json({ msg: 'Ese enlace no existe' })
      return next()
   }
   res.json({ archivo: enlace.nombre, password: false })

   next()
}