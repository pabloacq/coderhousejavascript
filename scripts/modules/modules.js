//clases
export class DataItem{
    constructor(id = null){
        this.id = id
    }

    guardar(){
        DB.guardar(this)
    }

    static getAll(){
        return DB.selectAll(this)
    }

    static getByID(id){
        return DB.selectByID(this,id)
    }

    static getByLindekDataItem(dataItem, dataItemName = null){
        const searchParm = dataItemName || dataItem.constructor.name 
        let searchArray = DB.selectAll(this)
        return searchArray.filter(thisObject => thisObject[searchParm.toLowerCase()] == dataItem.id)
    }

    static getBy(searchParm, searchParmValue){
        let searchArray = DB.selectAll(this)
        return searchArray.filter(thisObject => thisObject[searchParm.toLowerCase()] == searchParmValue)
    }

}

export class Turno extends DataItem{
    constructor({id=null, hora, dia, capacidad, actividad,inscriptos=[]})
    {
        super(id)
        this.inscriptos = inscriptos
        this.hora = hora
        this.dia = dia
        this.capacidad = capacidad
        this.actividad = actividad
        this.actividadNombre = Actividad.getByID(this.actividad).nombre
    }
    
    inscribir(persona)
    {
        if (this.capacidad > 0 && !this.inscriptos.includes(persona.id))
        {
            const actividad = Actividad.getByID(this.actividad)
            if (actividad.confirmarRequisitos()){
                this.inscriptos.push(persona.id)
                this.capacidad -= 1
                this.guardar()
                return true
            }
        }
        else{
            return false
        }
    }

    static getByID(id){
        return new Turno(super.getByID(id))
    }

    static getByLindekDataItem(object, dataItemName){
        let turnArray = []        
        super.getByLindekDataItem(object, dataItemName).forEach(turno => turnArray.push(new Turno(turno)))
        return turnArray
    }

    static getByInscripto(idInscripto){
        let turnArray = []
        this.getAll().forEach(turno => {
            if (turno.inscriptos.includes(idInscripto)) turnArray.push(new Turno(turno))
        })
        return turnArray
    }

    unsuscribe(idInscripto){

        let indexOf = this.inscriptos.indexOf(idInscripto)
        if (indexOf < 0) return

        let unsuscribed = this.inscriptos.splice(indexOf,1)
        this.capacidad += unsuscribed.length
        this.guardar()
    }
}

export class Persona extends DataItem{
    constructor({id, nombre, edad, dni}){
        super(id)
        this.nombre = nombre
        this.edad = edad
        this.dni = dni
    }

    static login({nombre, edad, dni}){
        let user = this.getBy("dni",dni)[0]
        if (!user){
            user = new Persona({nombre: nombre, edad: edad, dni: dni})
            user.guardar()
            user = this.getBy("dni",dni)[0]
        }else{
            if(nombre != user.nombre || edad != user.edad){
                throw("Error los datos no son correctos")
            }
        }
        return user
    }

    getTurnos(){
        return Turno.getByInscripto(this.id)
    }
}

export class Actividad extends DataItem{
    constructor({id=null, nombre, duracion}){
        super(id)
        this.nombre = nombre
        this.duracion = duracion
    }
    
    getTurnos(){
        return Turno.getByLindekDataItem(this)
    }
    
    confirmarRequisitos(){
        //La persona cumple con los requisitos para inscribirse en la actividad ? 
        return true
    }

    static getByID(id){
        return new Actividad(super.getByID(id))
    }
}

//Simular una Base de Datos
export class DB{
    static guardar(object) {
        let dbItemsArray = this.selectAll(object)
        
        if (this.#isNewToDB(object)){
            object.id = this.#calculateNextID(dbItemsArray)
        }
        else{
            dbItemsArray = this.#removeElementFromArray(object,dbItemsArray)
        }

        dbItemsArray.push(object)

        let dbItemName = this.#getDbItemName(object)
        this.#saveToDB(dbItemName,dbItemsArray)
    }

    static #removeElementFromArray(element,fromArray)
    {
        return fromArray.filter(object => object.id != element.id)
    }

    static #isNewToDB(object){
        return object.id == null
    }

    static #calculateNextID(dbItem){
        return dbItem.length + 1
    }

    static #getDbItemName(object){
        switch (object.name || object.constructor.name){
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

    static selectAll(object){
        return this.#getFromDB(this.#getDbItemName(object))
    }
    
    static selectByID(object, id){
        return this.#getFromDB(this.#getDbItemName(object)).filter(object => object.id == id)[0]
    }

   
    
    selectActividadXNombre(nombre){
        this.selectAll("Actividad")
        return this.actividades.filter(actividad => actividad.nombre == nombre)
    }
    
}