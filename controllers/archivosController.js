const multer = require('multer')
const shortid = require('shortid')
const fs = require('fs')
const Enlaces = require("../models/Enlaces")

exports.subirArchivo = async (req, res, next) => {
   const configuracionMulter = {
      limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
      storage: fileStorage = multer.diskStorage({
         destination: (req, file, cb) => {
            cb(null, __dirname+'/../uploads')
         },
         filename: (req, file, cb) => {
            const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
            cb(null, `${shortid.generate()}${extension}`)
         }
      })
   }
   const upload = multer(configuracionMulter).single('archivo')

   upload(req, res, async (error) => {

      if(!error) {
         res.json({archivo: req.file.filename})
      } else {
         console.log(error);
         return next()
      }
   })
}
exports.eliminarArchivo = async (req, res) => {

   try {
      fs.unlinkSync(__dirname+`/../uploads/${req.archivo}`)
      console.log('archivo eliminado');
   } catch (error) {
      console.log(error);
   }
}

exports.descargar = async (req, res, next) => {
   const { archivo } = req.params
   
   const archivoDescarga = __dirname + '/../uploads/' + archivo
   res.download(archivoDescarga);
   
   const enlace = await Enlaces.findOne({ nombre: req.params.archivo })
   const { descargas, nombre, id } = enlace

   if(descargas === 1) {
      req.archivo = nombre
      await Enlaces.findOneAndRemove(id)
      next()
   } else {
      enlace.descargas--
      await enlace.save()
   }
}