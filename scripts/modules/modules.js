//clases
export class Turno{
    constructor({hora, dia, capacidad, actividad,inscriptos=[]})
    {
        this.inscriptos = inscriptos
        this.hora = hora
        this.dia = dia
        this.capacidad = capacidad
        this.actividad = actividad
    }
    
    guardar(){
        DB.guardar(this)
    }
    
    registrar(persona)
    {
        if (this.capacidad > 0 && !this.inscriptos.includes(persona.dni))
        {
            this.inscriptos.push(persona.dni)
            this.capacidad -= 1
            this.guardar()
            return true
        }
        else{
            return false
        }
    }
}

export class Persona{
    constructor({nombre, edad, dni}){
        this.nombre = nombre
        this.edad = edad
        this.dni = dni
    }
    guardar(){
        DB.guardar(this)
    }
}

export class Actividad{
    constructor({id, nombre, duracion}){
        this.nombre = nombre
        this.duracion = duracion
        this.id = id
    }
    
    guardar(){
        DB.guardar(this)
    }
    
    getTurnos(){
        this.turnos = DB.selectTurnosXActividad(this)
        return this.turnos
    }
    
    inscribir(persona, hora, dia){
        if (this.confirmarRequisitos()){
            let turnos = DB.selectTurnosXActividad(this)
            let turno = turnos.filter(turno => turno.dia == dia && turno.hora == hora)[0]
            return turno.registrar(persona)
        }
    }
    confirmarRequisitos(){
        //La persona cumple con los requisitos para inscribirse en la actividad ? 
        return true
    }
}

//Simular una Base de Datos
export class DB{
    load(){
        if (localStorage.getItem("DB01personas")){
            JSON.parse(localStorage.getItem("DB01personas")).forEach(persona =>{
                this.personas.push(new Persona(persona))
        })}

        if (localStorage.getItem("DB01actividades")){
        JSON.parse(localStorage.getItem("DB01actividades")).forEach(actividad =>{
            this.actividades.push(new Actividad(actividad))
        })}
        
        if (localStorage.getItem("DB01turnos")){
        JSON.parse(localStorage.getItem("DB01turnos")).forEach(turno =>{
            this.turnos.push(new Turno(turno))
        })}
    }

    static guardar(object) {
        let dbItemName = this.#getDbItemName(object)
        let dbItem = this.#getFromDB(dbItemName)
        
        if (this.#isObjectNewToDB(object)){
            object.id = calculateNextID(dbItem)
        }

        //TO-DO Reemplazar por splice?
        dbItem[object.id-1] = object
        console.log(dbItem)
        this.#saveToDB(dbItemName,dbItem)
    }

    static #isObjectNewToDB(object){
        return object.id == null
    }

    static #calculateNextID(dbItem){
        return dbItem.length + 1
    }

    static #getDbItemName(object){
        switch (object.constructor.name){
            case "Persona":
                return "DB01personas"
            case "Actividad":
                return "DB01actividades"
            case "Turno":
                return "DB01turnos"
            default:
                console.log("Objeto no valido")
        }
    }

    static #saveToDB(localStorageItemName,localStorageItemValue){
        localStorage.setItem(localStorageItemName,JSON.stringify(localStorageItemValue))
    }

    static #getFromDB(localStorageItemName){
        let localStorageItemValue = localStorage.getItem(localStorageItemName)
        let resultsArray = []
        if (localStorageItemValue){
            JSON.parse(localStorageItemValue).forEach(object =>{
                resultsArray.push(object)
        })}

        return resultsArray
    }

    selectAll(clase){
        switch (clase){
            case "Persona":
                return this.personas
            case "Actividad":
                return this.actividades
            case "Turno":

                return this.turnos
            default:
                return []
        }
    }
    count(clase){
        switch (clase){
            case "Persona":
                return this.personas.length
            case "Actividad":
                return this.actividades.length
            case "Turno":
                return this.turnos.length
            default:
                return []
        }
    }
    
    selectTurnosXActividad(actividad){
        this.selectAll("Turno")
        return this.turnos.filter(turno => turno.actividad == actividad.id)
    }
    
    selectActividadXNombre(nombre){
        this.selectAll("Actividad")
        return this.actividades.filter(actividad => actividad.nombre == nombre)
    }
    
    selectActividadXid(id){
        return this.actividades.filter(actividad => actividad.id == id)[0]
    }
    
}