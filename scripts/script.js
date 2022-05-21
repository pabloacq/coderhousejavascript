//clases
class Turno{
    constructor({hora, dia, capacidad, actividad,inscriptos=[]})
    {
        this.inscriptos = inscriptos
        this.hora = hora
        this.dia = dia
        this.capacidad = capacidad
        this.actividad = actividad
        this.id = db.count("Turno")+1
    }
    
    guardar(){
        db.guardar(this)
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

class Persona{
    constructor({nombre, edad, dni}){
        this.nombre = nombre
        this.edad = edad
        this.dni = dni
    }
    guardar(){
        db.guardar(this)
    }
}

class Actividad{
    constructor({id, nombre, duracion}){
        this.nombre = nombre
        this.duracion = duracion
        this.id = id
    }
    
    guardar(){
        db.guardar(this)
    }
    
    getTurnos(){
        this.turnos = db.selectTurnosXActividad(this)
        return this.turnos
    }
    
    inscribir(persona, hora, dia){
        if (this.confirmarRequisitos()){
            let turnos = db.selectTurnosXActividad(this)
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
class DB{
    constructor(){
        this.turnos = localStorage.getItem("DB01turnos") || []
        this.personas = localStorage.getItem("DB01personas") || []
        this.actividades = localStorage.getItem("DB01actividades") || []
    }
    guardar(object) {
        switch (object.constructor.name){
            case "Persona":
                this.personas.push(object)
                localStorage.setItem("DB01personas",JSON.stringify(this.personas))
                break
            case "Actividad":
                this.actividades.push(object)
                localStorage.setItem("DB01actividades",JSON.stringify(this.actividades))
                break
            case "Turno":
                console.log(object.id)
                console.log(localStorage.getItem("DB01turnos"))
                console.log(JSON.stringify(this.turnos))
                let index = this.turnos.findIndex(turno => turno.id == object.id)
                index == -1 ? this.turnos.push(object): this.turnos[index] = object
                localStorage.setItem("DB01turnos",JSON.stringify(this.turnos))

                console.log(localStorage.getItem("DB01turnos"))
                console.log(JSON.stringify(this.turnos))
                break
            default:
                console.log("Objeto no valido")
                break
        }
    }
    selectAll(clase){
        switch (clase){
            case "Persona":
                this.personas = []
                localStorage.getItem("DB01personas").forEach(persona =>{
                    this.personas.push(new Persona(persona))
                })
                return this.personas
            case "Actividad":
                this.actividades = []
                
                JSON.parse(localStorage.getItem("DB01actividades")).forEach(actividad =>{
                    this.actividades.push(new Actividad(actividad))
                })
                return this.actividades
            case "Turno":
                this.turnos = []
                JSON.parse(localStorage.getItem("DB01turnos")).forEach(turno =>{
                    this.turnos.push(new Turno(turno))
                })
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

//Declarar la Base de datos como global
const db = new DB()
let actividadSeleccionada,persona,diaSeleccionado
main();




//main
function main(){
    init()
    
    let observer = new MutationObserver((mutationList, observer)=>{addListeners(mutationList, observer)})
    observer.observe(document.getElementById("divActividades"),{childList: true, subtree:true})
    
    addListenerToBotonSubmit()
}

//funciones
function init (){
    if (!localStorage.getItem("DB01actividades")){
        //Cargar datos iniciales a la DB
        const actividad1 = new Actividad({id:1, nombre:"Yoga",duracion:"60"})
        actividad1.guardar()
        const actividad2 = new Actividad({id:2, nombre:"Stretching",duracion:"60"})
        actividad2.guardar()
        const actividad3 = new Actividad({id:3, nombre:"SportCycle",duracion:"50"})
        actividad3.guardar()
        
        
        new Turno({hora:"09:00",dia:"Lunes",capacidad:"20", actividad: actividad1.id }).guardar()
        new Turno({hora:"15:00",dia:"Martes",capacidad:"20", actividad: actividad1.id }).guardar()
        new Turno({hora:"18:00",dia:"Miercoles",capacidad:"20", actividad: actividad2.id }).guardar()
        new Turno({hora:"11:00",dia:"Viernes",capacidad:"20", actividad: actividad3.id }).guardar()
        new Turno({hora:"12:00",dia:"Sabado",capacidad:"20", actividad: actividad3.id }).guardar()
        new Turno({hora:"17:00",dia:"Lunes",capacidad:"20", actividad: actividad3.id }).guardar()
        new Turno({hora:"09:00",dia:"Jueves",capacidad:"20", actividad: actividad2.id }).guardar()
        new Turno({hora:"20:00",dia:"Jueves",capacidad:"20", actividad: actividad1.id }).guardar()
    }
}

function addListenerToBotonSubmit(){  
    let botonSubmit = document.getElementById("botonSubmit")
    botonSubmit.addEventListener('click',() => {   
        //Habilitar el dropdown de actividades
        document.getElementById("dropdownMenuButton1").disabled=false
        if (document.getElementById("inputNombre").value != "" && document.getElementById("inputEdad").value != "" && document.getElementById("inputDNI").value!=""){
            updateMessage({text:"Seleccione una actividad",
                           type:"information"})
            
            //Instanciar un nuevo objeto Persona
            persona = new Persona({
                nombre: document.getElementById("inputNombre").value, 
                edad: document.getElementById("inputEdad").value, 
                dni: document.getElementById("inputDNI").value})
            
            //Cargar el dropdown de actividades
            let dropdownActividades = document.getElementById("dropdownActividades")
            let actividades = db.selectAll("Actividad")
            for (i=0;i<actividades.length;i++)
            {
                dropdownActividades.innerHTML += `<li><a class="dropdown-item" name="actividad" id="botonActividad${actividades[i].id}">${actividades[i].nombre}</a></li>`
            }
        }
        else{
            document.getElementById("dropdownMenuButton1").disabled = true
            updateMessage({text:"Debe rellenar todos los campos para continuar",
                           type:"error"})
        }
    })
}

function addListeners(mutationList, observer){
    mutationList.filter(child => child.target.id == "dropdownActividades" ).length > 0 ? AddListenersToActividades() : null
    mutationList.filter(child => child.target.id == "divDias" ).length > 0 ? addListenersToDias() : null
    mutationList.filter(child => child.target.id == "divHoras" ).length > 0 ? addListenersToHoras() : null
}

function AddListenersToActividades(){
    console.log("Adding Listeners To Actividades")
    //Agregar los listeners a las opciones del dropdown
    const actividades = document.getElementsByName("actividad")
    actividades.forEach( actividad => {
        actividad.addEventListener('click',() => {
            updateMessage({text:"Seleccione un dia de la semana",
                           type:"information"})
            actividadSeleccionada = db.selectActividadXid(actividad.id.replace("botonActividad",""))
            document.getElementById("dropdownMenuButton1").innerHTML=actividadSeleccionada.nombre
            let divDias = document.getElementById("divDias")
            
            divDias.innerHTML = "" //Borrar el conetenido del div
            
            let turnos = actividadSeleccionada.getTurnos()
            
            let dias =[]
            for (i=0;i<turnos.length;i++){
                let dia = turnos[i].dia
                
                if (!dias.includes(dia,0)){
                    dias.push(dia);
                }
            }
            dias.forEach(dia => {
                divDias.innerHTML += `<button type="button" class="btn btn-primary" name="dia" id="boton_${dia}">${dia}</button>\n`
            })      
        })
    })
}

function addListenersToDias(){
    console.log("Adding Listeners To Dias")
    const dias = document.getElementsByName("dia")
    dias.forEach(dia =>{
        dia.addEventListener('click', () => {
            updateMessage({text:"Seleccione una hora",
                           type:"information"})
            diaSeleccionado = dia.innerHTML
            console.log("Adding Listeners to Horas")
            let horas = actividadSeleccionada.getTurnos().filter(turno => turno.dia == dia.innerHTML)
            let divHoras = document.getElementById("divHoras")
            divHoras.innerHTML =""
            horas.forEach(hora =>{
                divHoras.innerHTML += `<button type="button" class="btn btn-success" name="hora" id="turno_${hora.id}">${hora.hora}</button>`
            })
        })
    })
}

function addListenersToHoras(){
    const horas = document.getElementsByName("hora")
    horas.forEach(hora =>{
        hora.addEventListener('click',() => {
            horaSeleccionada = hora.innerHTML
            if(actividadSeleccionada.inscribir(persona,horaSeleccionada,diaSeleccionado)){
                updateMessage({text: `Usted se inscribio con exito a ${actividadSeleccionada.nombre} los dias ${diaSeleccionado} a las ${horaSeleccionada} hs.`, 
                               type:"success"})
            }
            else{
                updateMessage({text:`Error, tal vez ya esta inscripto?`, 
                               type:"error"})
            }
        })
    })
}

function updateMessage({text, type}){

    if (type == "information") {
        updateMessageInDiv({text: text, type:type})
        return
    }
    updateMessageInAlert({text: text, type:type})
}

function updateMessageInDiv({text, type}){
    const divAlert = document.getElementById("divAlert")
    let cssClass
    cssClass="alert alert-primary mt-3";
    divAlert.className = cssClass
    divAlert.innerHTML = text
}

function updateMessageInAlert({text, type}){
    let position = 'top-end'

    if (type == 'error'){
        position = 'center'}
        

    Swal.fire({
        position: position,
        icon: type,
        title: text,
        showConfirmButton: true
      })
}