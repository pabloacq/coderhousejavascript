

//clases
class Turno{
    constructor(hora, dia, capacidad, actividad)
    {
        this.hora = hora
        this.dia = dia
        this.capacidad = capacidad
        this.actividad = actividad.nombre
        this.ID = db.count(this)+1
    }

    guardar(){
        db.guardar(this)
    }

    registrar(persona)
    {
        if (this.capacidad > 0)
        {
            this.inscriptos.push(persona.dni)
            this.capacidad -= 1
            this.guardar()
            return true
        }
        return false
    }
}

class Persona{
    constructor(nombre, edad, dni){
        this.nombre = nombre
        this.edad = edad
        this.dni = dni
    }

    guardar(){
        db.guardar(this)
    }
}

class Actividad{
    constructor(nombre, duracion){
        this.nombre = nombre
        this.duracion = duracion
    }

    guardar(){
        db.guardar(this)
    }

    mostrarTurnos(){
        return db.selectTurnosXActividad(this.nombre)
    }

    inscribir(persona, hora, dia){
        if (this.confirmarRequisitos()){
            let turnos = db.selectTurnosXActividad(this.nombre)
            let turno = turnos.filter(turno => turno.dia == dia && turno.hora == hora)[0]
            if (turno.registrar(persona))alert(`Usted se incribio con exito a ${this.nombre} los dias ${dia} a las ${hora} hs.`)
        }
    }

    confirmarRequisitos(){
        //La persona cumple con los requisitos para inscribirse en la actividad ? 
        return true
    }
}

//Simular una Base de Datos para poder "guardar datos"
class DB{
    constructor(){
        this.turnos = []
        this.personas = []
        this.actividades = []
    }

    guardar(object) {
        switch (object.constructor.name){
            case "Persona":
                this.personas.push(object)
                break
            case "Actividad":
                this.actividades.push(object)
                break
            case "Turno":
                
                this.turnos.push(object)
                break
            default:
                console.log("Objeto no valido")
                break
        }
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
        return this.turnos.filter(turno => turno.actividad == actividad);
    }

}


//main

    //Declarar la Base de datos como global
    const db = new DB()
    init()

    let nombre = prompt("Bienvenido!\nIngrese su nombre y apellido")
    let edad = prompt("Ingrese su edad")
    let dni = prompt("Ingrese su DNI")

    let persona = new Persona(nombre, edad, dni)
    persona.guardar()


    let actividades = db.selectAll("Actividad")
    let actividadesString = ""
    for (i=0;i<actividades.length;i++)
    {
        actividadesString += actividades[i].nombre +"\n"
    }

    let actividadSeleccionada = prompt(`Seleccione una actividad \n\nActividades Disponibles: \n${actividadesString}`)
    let actividad =  actividades.filter(actividad => actividad.nombre == actividadSeleccionada)[0];
    console.log(actividad)

    let turnos = actividad.mostrarTurnos()
    let dias =[], diasString =""
    for (i=0;i<turnos.length;i++){
         let dia = turnos[i].dia

         if (!dias.includes(dia,0)){
            dias.push(dia);
            diasString += dia + "\n"
         }
    }

    let diaSeleccionado = prompt(`Seleccione un dia \n\nDias Disponibles: \n${diasString}`)

    let horarios = turnos.filter(turno => turno.dia == diaSeleccionado), horariosString="", horas=[]
    for (i=0;i<horarios.length;i++){
         let hora = horarios[i].hora

         if (!horas.includes(hora,0)){
            horas.push(hora);
            horariosString += hora + "\n"
         }
    }
    let HoraSeleccionada = prompt(`Seleccione un horario \n\nHorarios Disponibles: \n${horariosString}`)

    actividad.inscribir(persona, HoraSeleccionada, diaSeleccionado)
    

    

    

    






    
//funciones
function init (){
    //Cargar datos iniciales a la DB
    const actividad1 = new Actividad("Yoga","60")
    const actividad2 = new Actividad("Stretching","60")
    const actividad3 = new Actividad("SportCycle","50")

    actividad1.guardar()
    actividad2.guardar()
    actividad3.guardar()

    const turno = new Turno("09:00","Lunes","20", actividad1 )
    const turno1 = new Turno("15:00", "Miercoles","20", actividad1)
    const turno2 = new Turno("11:30", "Jueves","20", actividad2)
    const turno3 = new Turno("15:00", "Sabado","20", actividad2)
    const turno4 = new Turno("09:00", "Jueves","20", actividad3)
    const turno5 = new Turno("16:00", "Miercoles","20", actividad3)
    const turno6 = new Turno("09:00", "Martes","20", actividad3)
    const turno7 = new Turno("13:00", "Sabado","20", actividad2)

    turno.guardar()
    turno1.guardar()
    turno2.guardar()
    turno3.guardar()
    turno4.guardar()
    turno5.guardar()
    turno6.guardar()
    turno7.guardar()

    
}