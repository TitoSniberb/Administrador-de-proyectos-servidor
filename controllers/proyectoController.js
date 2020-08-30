const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');
exports.crearProyecto = async (req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({ errores: errores.array() });
    }
    
    try {
        // Crear un nuevo proyecto
        const proyecto = new Proyecto(req.body)

        // Guardar el creador via JWT
        proyecto.creador = req.usuario.id;

        // Guardamos el proyecto
        proyecto.save();
        res.json(proyecto);

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

// Obtiene todos los proyectos del usuarui actual
exports.obtenerProyectos = async (req, res) => {
    try{
        const proyectos = await Proyecto.find({ creador: req.usuario.id });
        res.json({ proyectos });

    } catch (error) {
        res.status(500).send('Uwu un problema');
    }
}

// Actualiza un proyecto
exports.actualizarProyecto = async (req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({ errores: errores.array() });
    }
     
    const { nombre } = req.body;
    const nuevoProyecto = {};

    if(nombre) {
        nuevoProyecto.nombre = nombre;
    }

    try {
        // Revisar Id
        let proyecto = await Proyecto.findById(req.params.id);

        // Revisar si existe el proyecto
        if(!proyecto) {
            return res.status(404).json({ msg: 'Proyecto no encontrado.' });
        }

        // Verificar al creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        // Actualizar
        proyecto = await Proyecto.findByIdAndUpdate({ _id: req.params.id }, 
            { $set: nuevoProyecto }, { new: true });

        res.json({ proyecto });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

// Eliminar proyecto
exports.eliminarProyecto = async (req, res) => {
    try {
        // Revisar Id
        let proyecto = await Proyecto.findById(req.params.id);

        // Revisar si existe el proyecto
        if(!proyecto) {
            return res.status(404).json({ msg: 'Proyecto no encontrado.' });
        }

        // Verificar al creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        // Eliminar el proyecto
        await Proyecto.findOneAndRemove({ _id: req.params.id });
        res.json({ msg: 'Proyecto eliminado' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}