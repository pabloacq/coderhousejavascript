import {Turno, Actividad, Persona, DataItem} from "./modules/modules.js"

main();

//main
async function main(){
    await init()
    const user = getUserFromSessionStorage() 
    if (user) {
        document.getElementById("btnInscribirse").addEventListener('click',() => showTurnPicker(user))
        document.getElementById("btnMisInscripciones").addEventListener('click',() => showTurnList(user))
        showTurnPicker(user)
    }else{ showLogin()}
}

async function showTurnList(user){
    if (await userNotLoggedRedirect(user)) return   
    await insertPartialInElement("./html/_turnList.html","appDiv")
    let rowHTML = ""
    await fetch("./html/_turnListRow.html").then(response => response.text()).then(text => rowHTML = text);
    let tBody = ""
    let turnos = user.getTurnos()
    if (turnos.length > 0){
        turnos.forEach(turno =>{
            let thisRow = rowHTML
            thisRow = thisRow.replace("%actividad%",turno.actividadNombre)
            thisRow = thisRow.replace("%dia%",turno.dia)
            thisRow = thisRow.replace("%hora%",turno.hora)
            thisRow = thisRow.replace("%id%",`unsuscribe_${turno.id}`)
            tBody += thisRow
        })    
    }
    else{
        document.getElementById("turnDiv").innerHTML = "<p class='my-3 text-white'>Todavia no estas inscripto a ninguna actividad</p>"
        return
    }
    document.getElementById("turnListBody").innerHTML = tBody
    document.getElementsByName("unsuscribe").forEach(button => {
        button.addEventListener('click', ()=>{
            let idTurno = button.id.replace("unsuscribe_","")
            Turno.getByID(idTurno).unsuscribe(user.id)
            showTurnList(user)
        })
    })
}

async function showLogin(){
    await insertPartialInElement("./html/_login.html","appDiv")
    addListenerToLoginButton()
}

function addListenerToLoginButton(){
    let loginForm = document.getElementById("loginForm")
    loginForm.addEventListener('submit',(e) => { 
        e.preventDefault()

        if (!e.target.inputNombre.value || !e.target.inputEdad.value || !e.target.inputDNI.value){
            updateMessage({text:"Debe completar todos los datos para continuar",type:"error"})
            return
        }

        login({ nombre:e.target.inputNombre.value,
                edad: e.target.inputEdad.value,
                dni: e.target.inputDNI.value})
        main()
    })
}

async function login(persona){
    try{
        const user = await Persona.login(persona)
        setUserInSessionStorage(user)
        showTurnPicker(user)
    }
    catch(e){
        updateMessage({text:e, type:"error"})
    }
}

function logOut(){
    sessionStorage.removeItem(sessionStorageUserKeyName())
    document.getElementById("userDiv").innerHTML=""
    showLogin()
}

async function showTurnPicker(user){
    if (await userNotLoggedRedirect(user)) return   

    await insertPartialInElement("./html/_user.html","userDiv")
    document.getElementById("navbarDropdown").innerHTML = user.nombre
    document.getElementById("userLogOut").addEventListener('click',() => logOut())

    await insertPartialInElement("./html/_turnPicker.html","appDiv")
    
    let observer = new MutationObserver(mutationList=>{
        addListeners(mutationList)
    })
    observer.observe(document.getElementById("divActividades"),{childList: true, subtree:true})
    
    updateMessage({text:"Seleccione una actividad",
    type:"information"})
    
    //Habilitar el dropdown de actividades
    document.getElementById("dropdownMenuButton1").disabled=false
    if (document.getElementById("dropdownActividades").childNodes.length > 1) return
    
    //Cargar el dropdown de actividades
    let dropdownActividades = document.getElementById("dropdownActividades")
    let actividades = Actividad.getAll()
    
    for (let i=0;i<actividades.length;i++)
    {
        dropdownActividades.innerHTML += `<li><a class="dropdown-item" name="actividad" id="botonActividad_${actividades[i].id}">${actividades[i].nombre}</a></li>`
    }
}

async function userNotLoggedRedirect(user){
    let isUserNull = (user == null) 
    if (isUserNull) showLogin()
    return isUserNull
}

async function insertPartialInElement(URL, elementID){
    await fetch(URL).then(response => response.text()).then(text => document.getElementById(elementID).innerHTML=text);
}
//funciones
async function init (){
    if (!localStorage.getItem("DB01actividades")){
        //Cargar datos iniciales a la DB
        await fetch("./DB/actividades.JSON")
        .then(response => response.json())
        .then(actividades => { actividades.forEach(actividad => {
            const newActividad = new Actividad({id:actividad.id, nombre:actividad.nombre,duracion:actividad.duracion})
            newActividad.guardar()
        })})

        new Turno({hora:"09:00",dia:"Lunes",capacidad:"20", actividad: "1" }).guardar()
        new Turno({hora:"15:00",dia:"Martes",capacidad:"20", actividad: "1" }).guardar()
        new Turno({hora:"18:00",dia:"Miercoles",capacidad:"20", actividad: "2" }).guardar()
        new Turno({hora:"11:00",dia:"Viernes",capacidad:"20", actividad: "3" }).guardar()
        new Turno({hora:"12:00",dia:"Sabado",capacidad:"20", actividad: "3" }).guardar()
        new Turno({hora:"17:00",dia:"Lunes",capacidad:"20", actividad: "3" }).guardar()
        new Turno({hora:"09:00",dia:"Jueves",capacidad:"20", actividad: "2" }).guardar()
        new Turno({hora:"20:00",dia:"Jueves",capacidad:"20", actividad: "1" }).guardar()
    }
}


function addListeners(mutationList){
    mutationList.filter(child => child.target.id == "dropdownActividades" ).length > 0 ? AddListenersToActividades() : null
    mutationList.filter(child => child.target.id == "divDias" ).length > 0 ? addListenersToDias() : null
    mutationList.filter(child => child.target.id == "divHoras" ).length > 0 ? addListenersToHoras() : null
}

function AddListenersToActividades(){
    //Agregar los listeners a las opciones del dropdown
    const botonesActividad = document.getElementsByName("actividad")
    botonesActividad.forEach(botonActividad => {
        botonActividad.addEventListener('click',() => {
            updateMessage({text:"Seleccione un dia de la semana",
                           type:"information"})

            let idActividad = botonActividad.id.replace("botonActividad_","")
            document.getElementById("dropdownMenuButton1").innerHTML = botonActividad.innerHTML
            document.getElementById("dropdownMenuButton1").value = idActividad

            let divDias = document.getElementById("divDias")

            divDias.innerHTML = "" //Borrar el conetenido del div
            document.getElementById("divHoras").innerHTML = "" //Borrar el conetenido del div

            let turnos = Turno.getByLindekDataItem(new DataItem(idActividad),"Actividad")

            let dias =[]
            for (let i=0;i<turnos.length;i++){
                let dia = turnos[i].dia

                if (!dias.includes(dia,0)){
                    dias.push(dia);
                }
            }
            dias.forEach(dia => {
                divDias.innerHTML += `<button type="button" class=" w-23 btn btn-primary mt-1 mx-1" name="dia" id="boton_${dia}">${dia}</button>`
            })
        })
    })
}

function addListenersToDias(){
    const dias = document.getElementsByName("dia")
    dias.forEach(dia =>{
        dia.addEventListener('click', () => {
            updateMessage({text:"Seleccione un horario",
                           type:"information"})
            let turnos = Turno.getByLindekDataItem(new DataItem(document.getElementById("dropdownMenuButton1").value),"Actividad")
            turnos = turnos.filter(turno => turno.dia == dia.innerHTML)
            let divHoras = document.getElementById("divHoras")
            divHoras.innerHTML =""
            turnos.forEach(turno =>{
                divHoras.innerHTML += `<button type="button" class=" btn btn-success mt-1 mx-1" name="hora" id="turno_${turno.id}">${turno.hora}</button>`
            })
        })
    })
}

function addListenersToHoras(){
    const horas = document.getElementsByName("hora")
    horas.forEach(hora =>{
        hora.addEventListener('click',() => {
            horasEventListener(hora)
        })
    })
}

function horasEventListener(hora){
    let turnoSeleccionado = Turno.getByID(hora.id.replace("turno_",""))
    let nombreActividad = document.getElementById("dropdownMenuButton1").innerHTML
    
    Swal.fire({
        title: `Usted va a inscribirse a ${nombreActividad} los dias ${turnoSeleccionado.dia} a las ${turnoSeleccionado.hora} hs. ¿Desea Continuar?`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
            if(turnoSeleccionado.inscribir(getUserFromSessionStorage())){
                updateMessage({text: `Usted se inscribio con exito a ${nombreActividad} los dias ${turnoSeleccionado.dia} a las ${turnoSeleccionado.hora} hs.`,
                type:"success"})
            }
            else{
                updateMessage({text:`Error, tal vez ya esta inscripto?`,
                type:"error"})
            }
        }
    })
}

function updateMessage({text, type}){
    if (type == "information") {
        updateMessageInP({text: text, type:type})
        return
    }
    updateMessageInAlert({text: text, type:type})
}

function updateMessageInP({text, type}){
    const pAlert = document.getElementById("divAlert")
    pAlert.innerHTML = text
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

function getUserFromSessionStorage(){
    let sessionStorageValue = JSON.parse(sessionStorage.getItem(sessionStorageUserKeyName()))
    return sessionStorageValue ? new Persona(sessionStorageValue) : null
}

function setUserInSessionStorage(user){
    sessionStorage.setItem(sessionStorageUserKeyName(),JSON.stringify(user))
}

function sessionStorageUserKeyName(){
    return "appUser"
}