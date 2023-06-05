const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config({path: 'variables.env'})
const { validationResult } = require('express-validator')

exports.autenticarUsuario = async (req, res, next) => {
   const errores = validationResult(req)
   if(!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() })
   }

   const { email, password } = req.body
   
   const usuario = await Usuario.findOne({ email })

   if(!usuario) {
      res.status(401).json({ msg: 'El Usuario no existe'})
      return
      // return next()
   }

   if(bcrypt.compareSync(password, usuario.password)) {
      const token = jwt.sign({
         id: usuario._id,
         nombre: usuario.nombre,
         email: usuario.email
      }, process.env.SECRETA, {
         expiresIn: '8h'
      })
      res.json({ token });
   } else {
      res.status(404).json({ msg: 'Password Incorrecto '})
      return 
      // return next()
   }
}
exports.usuarioAutenticado = (req, res, next) => {
   res.json({ usuario: req.usuario })
}