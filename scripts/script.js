import {Turno, Actividad, Persona} from "./modules/modules.js"

//Declarar la Base de datos como global
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
        console.log("init")
        //Cargar datos iniciales a la DB
        fetch("./DB/actividades.JSON")
        .then(response => response.json())
        .then(actividades => { actividades.forEach(actividad => {
            const newActividad = new Actividad({id:actividad.id, nombre:actividad.nombre,duracion:actividad.duracion})
            console.log(newActividad)
            newActividad.guardar()
        })})
        
        new Turno({hora:"09:00",dia:"Lunes",capacidad:"20", actividad: "1" }).guardar()
        new Turno({hora:"15:00",dia:"Martes",capacidad:"20", actividad: "1" }).guardar()
        new Turno({hora:"18:00",dia:"Miercoles",capacidad:"20", actividad: "2" }).guardar()
        new Turno({hora:"11:00",dia:"Viernes",capacidad:"20", actividad: "3" }).guardar()
        new Turno({hora:"12:00",dia:"Sabado",capacidad:"20", actividad: "4" }).guardar()
        new Turno({hora:"17:00",dia:"Lunes",capacidad:"20", actividad: "3" }).guardar()
        new Turno({hora:"09:00",dia:"Jueves",capacidad:"20", actividad: "2" }).guardar()
        new Turno({hora:"20:00",dia:"Jueves",capacidad:"20", actividad: "1" }).guardar()
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