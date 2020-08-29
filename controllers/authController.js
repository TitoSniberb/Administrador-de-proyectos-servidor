const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.autenticarUsuario = async (req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({ errores: errores.array() });
    }

    // Extraer email y pass
    const { email, password } = req.body

    try {
        // Revisar que este registrado
        let usuario = await Usuario.findOne({ email });
        if(!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' })
        }

        // Revisar la pass
        const passCorrecto = await bcryptjs.compare(password, usuario.password)
        if(!passCorrecto) { 
            return res.status(400).json({ msg: 'Password incorrecto' })
        }

        // Si todo es correcto crear y firmar el Json Web Token
        const payload = {
            usuario: {
                id: usuario.id
            }
        };

        // Firmar el JWT
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 3600 // 1 hora
        }, (error, token) => {
            if(error) throw error;
                    
            // Mensaje confirmacion
            res.json({ token })
        });


    } catch (error) {
        console.log(error)
    }
}