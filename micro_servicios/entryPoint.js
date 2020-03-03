"use strict";
process.env.NODE_DEBUG = 'fs';
//dependencias de node
const	http		=	require('http'),
		dgram		=	require('dgram'),
		q			=	require('q'),
		http_port	=	30101,
		querystring =	require('querystring'),
		mongoose	=	require('mongoose'),
		config		=	require("./modulos/configs")


mongoose.connect(config.nosqldb,{
			useMongoClient: true,
			autoReconnect:true
		}, function(err1){
	if (err1) {
		console.log('Error conectando a mongodb');
	}else{
		console.log('Mongodb Correctamente conectado.');
		mongoose.Promise = global.Promise;
	}
});
//modulos incluidos
//const	config		=	require("./modulos/configs");
let		database 	=	require("./modulos/postgresql.js");
let		nosql 		=	require("./modulos/nosql/mongodb.js");

//inclusion de modelos gps
let		gv300_		=	require("./modulos/gpsmods/gv300.js"),
		gv200_		=	require("./modulos/gpsmods/gv200.js"),
		gv55_		=	require("./modulos/gpsmods/gv55.js"),
		gl300_		=	require("./modulos/gpsmods/gl300.js"),
		gl200_		=	require("./modulos/gpsmods/gl200.js"),
		gmt100_		=	require("./modulos/gpsmods/gmt100.js"),
		traccar_	=	require("./modulos/gpsmods/traccar.js"),
		modelos		=	{
							gv300 	: gv300_,
							gv200 	: gv200_,
							gv55 	: gv55_,
							gl300 	: gl300_,
							gl200 	: gl200_,
							traccar : traccar_
						};

//inclusion de modulos para el procesamiento de objetos
/*
se realiza una subdivicion de los tipos de transmiciones de cada GPS y
dependiendo del modelo y del evento se genera se llenara uno de los
siguientes objeros JSON que contienen los datos referente a ese evento
*/

// Manejo de conexion por Socket.IO-Client
let callbackinit =()=>{
	communicator.socketIO.on('exec', function(data){
		if(data.command &&  data.command == "GPSServRequest"){
			communicator.socketIO.emit('GPSServRegister', {nombre: "AllGPS Modules Server", descrip: "soy el servidor MB de los GPS, para enfora, queclink y Android"});
		}
		if(data.command &&  data.command == "HowIs"){
			communicator.socketIO.emit('GPSServRegister', {im: "GPSServ", user: "null", flotas: [], vehiculos: []});
		}
	});
	communicator.socketIO.on('sendCommand', function(msg){
		console.log('sendCommand',msg);
		if (msg.imei in devices) {
			devices[msg.imei].engine.sendcommand(msg.command).then(function(datos){
				communicator.socketIO.emit('commandGPS',{status:'Air', cliente: msg.cliente, command: msg.command});
			}).fail(function(datos){
				communicator.socketIO.emit('commandGPS',{status:'Fail-AIR', cliente:msg.cliente, command: msg.command});
			});
		}else{
			communicator.socketIO.emit('commandGPS',{status:'Fail-N/F', cliente: msg.cliente, command: msg.command, ack: msg.ack});
		}
	});
	communicator.socketIO.on('newroom', function (_imei) {
		rooms_in[_imei] = true;
		if (_imei in devices) {
			let dir = devices[_imei].dir;
			if (conexiones[dir].imei == _imei){
				communicator.socketIO.emit('msgtoroom',{room:_imei, obj:{},raw:'GPSMODULES_ONLINE',status:conexiones[dir].tipo, serv: dir, last: conexiones[dir].last});
			}else{
				//algo aqui que no cuadra los imeis no corresponden.
				communicator.socketIO.emit('msgtoroom',{room:_imei, obj:{},raw:'GPSMODULES_ONLINE',status:'Incorrect'});
			}
		}else{
			communicator.socketIO.emit('msgtoroom',{room:_imei, obj:{},raw:'GPSMODULES_ONLINE',status:'Not-Found'});
		}
		//console.log(rooms_in);
	});
	communicator.socketIO.on('transmision',function(data){
		//console.log('transmision en room', data.room);
	});
	communicator.socketIO.on('refreshmodule',function(data){
		console.log('voy a refreshmodule',data);
		appsmodules[data.modulo].load(data.parametros);
	});
	communicator.socketIO.on('refreshcars',function(data){
		core.getEquipo();
	});
	communicator.socketIO.on('offroom',function(data){
		if (rooms_in[data]) {
			rooms_in[data] = false;
		}else{
			console.log('nada de room para este imei offroom, muere');
		}
		//console.log('fuera de room ',data)
	});
}

let 	communicator	=	require('./modulos/communicator.js');

communicator.init(callbackinit);

let plglist 	=	require('./modulos/plugins/index.json');

let plgmodules 	=	{};

 //abrir json y llenar uno a uno los plugins en el json.
for(let pl in plglist){
	plgmodules[ pl+'_' ] = require(plglist[pl]);
};

let		eagleobj_	=	require("./modulos/objmods/eaglemod.js"), 		// Posicion
		geoobj_		=	require("./modulos/objmods/geomod.js"), 		// Geocercas hardware
		dinobj_		=	require("./modulos/objmods/dinmod.js"), 		// Entradas digitales
		devobj_		=	require("./modulos/objmods/devmod.js"), 		// Dispocitivos externos(Camaras, sensores)
		syncobj_	=	require("./modulos/objmods/syncmod.js"), 		// Sincronizacion(acuse de transmicion)
		eventobj_	=	require("./modulos/objmods/eventmod.js"), 		// Eventos(Remolcado, encendido, apagado,bateria)

//modulos de aplicaciones de la plataforma
		geomod_		= 	require("./modulos/appsmods/geomod.js"), 		// modulo para control de geocercas software
		stopmod_	= 	require("./modulos/appsmods/stopmod.js"), 		// modulo para control de paros software
		alertmod_	= 	require("./modulos/appsmods/alertmod.js"), 		// modulo para control de paros software
//modulos de los plugins de la plataforma

/* MODULO NUEVO DE PAROS este va recibir la posicion anterior y la actual*/

		objmodules	=	{
			eagleobj	: eagleobj_,
			geoobj		: geoobj_,
			dinobj		: dinobj_,
			devobj		: devobj_,
			syncobj		: syncobj_,
			eventobj	: eventobj_

		},
		appsmodules = {
			geomod		: geomod_,
			stopmod		: stopmod_,
			alertmod	: alertmod_
		};

//variables de servidor udp y socket.io
const		socket		=	dgram.createSocket('udp4');

//variables de manejo de informacion en memoria
let		equiposdb		=	{}; //Datos iniciales de la base de datos de los equipos SOLO.
let		devices			=	{}; //{"ip:puerto":{|Datos|}} Equipos que estan manejados en menoria, ya an transmitido
let		rooms_in		=	{}; //Imeis Siendo Escuchados
let		conexiones		=	{}; //objeto donde se almacenal las ip:puerto que usa el gps para comunicarse
let		Start			=	false; //para indicar si la carga a finalizado


//funciones de  proceso general y trabajo
class digestor {
	// Nadita comSpa
	constructor(parametro) {
	}

	// consulata DBPostgress y llena equiposdb
	getEquipo(){

		//console.log('In getEquipo');
		let parametro = {
			tipo:'status',
			campos:['eq_nid','eq_vimei','eq_vpass','mdl_vmodelo','vh_nid'],
			valores:['1','2']
		};
		database.getEquipo(parametro).then(function (resp){
			equiposdb = {};
			for (let i in resp.datos ) {
				equiposdb[resp.datos[i].eq_vimei]=resp.datos[i];
			}
			Start = true;
			//console.log('equiposdb',Start);
		})
	}

	// es llamado cuando un GPS transmite y su ip y puerto no esta egistrado en devices
	// determina su modelo, verifica su existencia en memorio base de datos y crea el objeto
	// o lo agrega a la lista de bloqueo en caso de no ser permitido!
	devicemake(raw,dir){
		try{
			let defer = q.defer();
			let comodin = raw.substring(0,1);
			let know = false;
			let imei = '';
			switch(comodin){
				case '+'://es un queclink
					imei = raw.split(',')[2];
					know = true;
					break;
				case '/'://es un celular via traccar app
					imei = raw.split('&')[0].split('id=')[1];
					//console.log(imei);
					know = true;
					break;
				default:
					conexiones[dir]={
						tipo: 'block',
						imei: 'imei_unknow',
						contblock : 0,
						last: new Date()
					};
					//console.log('unknow error reject ');
					defer.reject({tipo:'Error', raw: raw});
					know = false;
					break;
			}
			if (know) {
				//se crea el valor en el objeto de conexiones con el imei del gps quecklink
				conexiones[dir]={
					tipo: 'ok',
					imei: imei,
					contblock : 0,
					last: new Date()
				};
				//verifica si el imei ya esta en devices esto por si el gps cambio de ip:puerto a uno diferente.
				if (imei in devices) {
					devices[imei].dir = dir;
					devices[imei].engine['comkey'] = dir;
					defer.resolve({tipo:'Ok', equipo: imei, raw: raw});
				}else{
					//console.log('esto es',equiposdb[imei]);
					if (imei in equiposdb) {
						devices[imei] = {
							imei 	: imei,
							dir 	: dir,
							modelo 	: equiposdb[imei].mdl_vmodelo,
							engine 	: new modelos[equiposdb[imei].mdl_vmodelo](imei,dir,socket,equiposdb[imei].vh_nid)
						}
						//console.log('imei en equiposdb resolve ya');
						defer.resolve({tipo:'Ok', equipo: imei, raw: raw});
					}else{
						let parametro = {
							tipo:'imei',
							campos:['eq_nid','eq_vimei','eq_vpass','mdl_vmodelo','vh_nid'],
							valores:[imei]
						};
						//console.log('va mandar a getequipo IMEI');
						database.getEquipo(parametro).then(function (resp){
							//console.log("resp = >",resp);
							if (resp.tipo =='Ok') {
								equiposdb[resp.datos[0].eq_vimei]=resp.datos[0];
								//console.log(equiposdb);
								devices[imei] = {
									imei 	: imei,
									dir 	: dir,
									modelo 	: resp.datos[0].mdl_vmodelo,
									engine 	: new modelos[resp.datos[0].mdl_vmodelo](imei,dir,socket,resp.datos[0].vh_nid)
								}
								//console.log('imei no equiposdb pero ya y resolve ya');
								defer.resolve({tipo:'Ok', equipo: imei, raw: raw});
							}else{
								//crea nuevo valor en dir bloqueado.
								conexiones[dir].tipo = 'block';
								// devices[imei] = {
								// 	imei 	: imei,
								// 	dir 	: dir,
								// 	modelo 	: 'Bloqueado',
								// }
								//console.log('usted caballero esta bloqueado');
								defer.resolve({tipo:'NF', raw: raw});
							}
						});
					}
				}
			}
			//console.log('fuera de devicemake');
			return defer.promise;
		}catch(err){
			return false;
			console.log("Err on devicemake",raw,dir,err);
		}
	}

	//manda la transmicion a la clase del modelo del equipo(ingenieria del modelo GPS) con
	//los resultados de la creacion del equipo creado
	devicemakecb(resp){
		try{

			if (resp.tipo == 'Ok') {
				//console.log('llamada desde devicemake',resp.equipo,resp.raw);
				this.comforsure(resp.equipo,resp.raw);
			}else{
				//console.log('algo no ok aqui en devicemakecb',resp);
			}
		}catch(err){
			console.log("Err on devicemakecb",resp,err);
		}
	}

	// recibe de la clase de ingenieria de cada GPS recibe la transmicion y la digiere y
	// responde todos los procesos que debe realizar con la transmision ya separada
	// por campos la informacion
	decodecb(result){
		try{


			let arrobj = {};
			//console.log('decodecb',result);

			if (result.tipo == 'Ok') {
				//console.log(result.objetos)
				for (var i = 0; i < result.objetos.length; i++) {
					let _objeto = result.objetos[i];
					if (_objeto in objmodules) {

						let _imei = result.imei;
						let _modelo = devices[_imei].modelo;
						//*****aqui enviaria para los que estan conectados al ROOM del Imei la informacion devices[_imei].engine[_objeto]
						arrobj[_objeto] = devices[_imei].engine[_objeto];

						objmodules[_objeto].work(devices[_imei].engine[_objeto]);

						//aqui envio el eagleobj hacia los modulos de aplicaciones como geocercas, paros,  velocidades, etc.
						if (_objeto == 'eagleobj') {
							//modulos apps plataforma
							for (var mds in appsmodules){
								//por cada uno de los appmodules enviarles a su funcion work el objeto eagle.
								appsmodules[mds].work(devices[_imei].engine[_objeto]);
							}
							//modulos plugins
							for (var mds in plgmodules){
								//por cada uno de los plugins enviarles a su fincion work el objeto eagle,
								plgmodules[mds].work(devices[_imei].engine[_objeto]);
							}
						}
					}else{
						console.log('NO CONTROLADO OBJETO EXTRANIO',result.objetos[i]);
					}
				}
			}else{
				if (result.tipo == 'ACK') {
					communicator.socketIO.emit('ackcommand',result);
				}else{
					//console.log('.....NO OK RESP DECODECB......',result);
				}
			}

			if (rooms_in[result.imei]) {

				communicator.socketIO.emit('msgtoroom',{ room:result.imei, obj: arrobj, raw: result.raw });

			}else{
				//console.log('nada de room para este imei, muere');
				arrobj = {};
			}
		}catch(err){
			console.log("Err on decodecb",result,err);
		}
	}

	// determina si el GPS ya esta identificado en la memoria y procede con el desarrollo de su ingenieria,
	// en caso de no reconocer la conexion llama a DEVICEMAKE
	comdecide(comkey,raw){
		try{

			if (comkey in conexiones) {
				// actualiza la fecha de conexion.
				conexiones[comkey].last = new Date();

				if (conexiones[comkey].tipo == 'block') {
					if (raw.indexOf(conexiones[comkey].imei) > -1) {
						conexiones[comkey].contblock++;
						if (conexiones[comkey].contblock > 10) {
							//console.log('este esta transmitiendo mas de '+conexiones[comkey].contblock+' Veces ya');
							//*******Agregar al IPTABLES la direccion y el puerto a bloquear por 10 a GPS que no estan en base de datos prior 7 at 1/23/2017
						}
						//muere aqui.
						return;
					}else{
						//*******aqui se podria verificar algo antes no se puede ser el tiempo para ver si es una ip:puerto
						//*******muy vieja que ahora un gps correcto la tomo legitimamente.
						delete conexiones[comkey];
						this.devicemake(raw,comkey).then(this.devicemakecb.bind(this)).fail(this.failcb.bind(this));
					}
				}else{
					if (raw.indexOf(conexiones[comkey].imei) > -1) {//verifica que el imei este en la transmision
						//console.log('llamada desde comdecide',conexiones[comkey].imei,raw);
						this.comforsure(conexiones[comkey].imei,raw);
					}else{
						//**** se me ocurre poner algo aqui que compare las fechas de la ultima conexion
						//**** y esta para un servicio de gps OFLINE que indique que el gps ya volvio a transmitir despues de X tiempo.
						delete conexiones[comkey];
						this.devicemake(raw,comkey).then(this.devicemakecb.bind(this)).fail(this.failcb.bind(this));
					}
				};
			}else{
				//gps nuevo que transmite
				this.devicemake(raw,comkey).then(this.devicemakecb.bind(this)).fail(this.failcb.bind(this));
			}
		}catch(err){
			console.log("Err on comdecide",comkey,raw,err);
		}
	}

	//esta es la funcion que ordena la homologacion del comando recibido ya teniendo seguro que modelo de gps es.
	comforsure(imei,raw){
		try{
			devices[imei].engine.decode(raw).then(this.decodecb.bind(this)).fail(this.failcb.bind(this));
			nosql.saveraw(imei,raw);
		}catch(err){
			console.log("Err on comforsure",imei,raw,err);
		}
	}

	// en caso que cualquier promesa haya tenido erro viene a caer aqui
	failcb(err){
		//*******crear un protocolo de log para los errores.*******//
		console.log('err fail callback');
		console.log(err);
	}

}
let core = new digestor();


core.getEquipo();
//socket UDP
socket.on('message', function(content, rinfo) {
	try{
		let rdir 	=	rinfo.address,
			rport 	=	rinfo.port,
			raw		=	content.toString();
		let comkey = (rdir + ":" +rport);

		//console.log(comkey,'=>',raw);
		if (Start) {
			//console.log('aqui en start listo para comdecide');
			core.comdecide(comkey,raw);
		}else{
			//console.log('buffer aqui para start');
			//buffer aqui para start
			//muere aqui.
			return;
		}
	}catch(err){
		console.log("Err on Data",err);
	}
});


http.createServer(function(req, res) {
	let raw = req.url;
	var comkey = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	//console.log(comkey,'=>',raw,req.headers['user-agent']);

	if (Start) {
		//console.log('aqui en start listo para comdecide');
		core.comdecide(comkey,raw);
	}else{
		//console.log('buffer aqui para start');
		//buffer aqui para start
		//muere aqui.
		return;
	}

	if (req.method == 'POST') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('post received');
	}else{
		//console.log("UN GET POR AQUI");
		var html = '<html><body><form method="post" action="http://localhost:'+http_port+'">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
		// var html = fs.readFileSync('index.html');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	}
	req.connection.destroy();
}).listen(http_port);



socket.bind(30100);
