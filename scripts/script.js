//clases
class Turno{
    constructor(hora, dia, capacidad, actividad)
    {
        this.hora = hora
        this.dia = dia
        this.capacidad = capacidad
        this.actividad = actividad.nombre
        this.ID = db.count(this)+1
        this.inscriptos = []
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
    constructor(id, nombre, duracion){
        this.nombre = nombre
        this.duracion = duracion
        this.id = id
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

    selectActividadXNombre(nombre){
        return this.actividades.filter(actividad => actividad.nombre == nombre);
    }

}

//Declarar la Base de datos como global
const db = new DB()
main();




//main
function main(){
    init()

    let observer = new MutationObserver((mutationList, observer)=>{observador(mutationList, observer)})
    observer.observe(document.getElementById("divActividades"),{childList: true, subtree:true})

    addListeners()
}

//funciones
function init (){
    //Cargar datos iniciales a la DB
    const actividad1 = new Actividad(1, "Yoga","60")
    const actividad2 = new Actividad(2, "Stretching","60")
    const actividad3 = new Actividad(3, "SportCycle","50")

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

function botonSubmitAction(){     
        let divAlert = document.getElementById("divAlert")
        
        if (document.getElementById("inputNombre").value != "" || document.getElementById("inputEdad").value != "" || document.getElementById("inputDNI").value!=""){
            divAlert.className = "alert alert-primary mt-3"
            divAlert.innerHTML="Seleccione una actividad"
            let actividadSeleccionada, horaSeleccionada, diaSeleccionado;
            
            //Instanciar un nuevo objeto Persona
            let persona = new Persona(document.getElementById("inputNombre").value, document.getElementById("inputEdad").value, document.getElementById("inputDNI").value)
            
            //Cargar el dropdown de actividades
            let dropdownActividades = document.getElementById("dropdownActividades")
            let actividades = db.selectAll("Actividad")
            
            for (i=0;i<actividades.length;i++)
            {
                dropdownActividades.innerHTML += `<li><a class="dropdown-item" id="botonActividad${actividades[i].id}">${actividades[i].nombre}</a></li>`
            }
            
            //Agregar los listeners a las opciones del dropdown
            actividades.forEach( actividad => {
                document.getElementById(`botonActividad${actividad.id}`).addEventListener('click',() => {
                    divAlert.innerHTML="Seleccione un dia de la semana"
                    actividadSeleccionada = actividad
                    document.getElementById("dropdownMenuButton1").innerHTML=actividad.nombre
                    let divDias = document.getElementById("divDias")
                    
                    divDias.innerHTML = "" //Borrar el conetenido del div
                    
                    let turnos = actividad.mostrarTurnos()
                    
                    let dias =[]
                    for (i=0;i<turnos.length;i++){
                        let dia = turnos[i].dia
                        
                        if (!dias.includes(dia,0)){
                            dias.push(dia);
                        }
                    }
                    
                    dias.forEach(dia => {
                        divDias.innerHTML += `<button type="button" class="btn btn-primary" id="boton_${dia}">${dia}</button>\n`
                    })
                    
                    dias.forEach(dia =>{
                        document.getElementById(`boton_${dia}`).addEventListener('click', () => {
                            divAlert.innerHTML="Seleccione una hora"
                            diaSeleccionado = dia
                            let horas = turnos.filter(turno => turno.dia == dia)
                            let divHoras = document.getElementById("divHoras")
                            divHoras.innerHTML =""
                            horas.forEach(hora =>{
                                divHoras.innerHTML += `<button type="button" class="btn btn-success" id="turno_${hora.id}">${hora.hora}</button>`
                            })
                            horas.forEach(hora =>{
                                document.getElementById(`turno_${hora.id}`).addEventListener('click',() => {
                                    horaSeleccionada = hora
                                    if(actividadSeleccionada.inscribir(persona,horaSeleccionada.hora,diaSeleccionado)){
                                        divAlert.className = "alert alert-success mt-3"
                                        divAlert.innerHTML=`Usted se inscribio con exito a ${actividad.nombre} los dias ${diaSeleccionado} a las ${horaSeleccionada.hora} hs.`
                                    }
                                })
                            })
                        })
                    })
                })
            })
            
            //Habilitar el dropdown de actividades
            document.getElementById("dropdownMenuButton1").removeAttribute("disabled")
        }
        else{
            divAlert.className = "alert alert-danger mt-3"
            divAlert.innerHTML="Debe rellenar todos los campos"
        }
    
}

function addListeners(){
    let botonSubmit = document.getElementById("botonSubmit")
    botonSubmit.addEventListener('click',() => botonSubmitAction())
}

function observador(mutationList, observer){
    console.log(mutationList)
    console.log(observer)
}