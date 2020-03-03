'use strict';


const	config		= require("../configs");
const	_mongoose 	= require('mongoose'),
		q 			= require("q"),
		schemas		= require("./schemas");

let logout 			= false;

function _conect(){
	if (_mongoose.connection.readyState == '0') {
		_mongoose.connect(config.nosqldb,{
				useMongoClient: true,
				autoReconnect:true
		}, function(err1){
				if (err1) {
					console.log('Error conectando a mongodb');
					return false;
				}else{
					console.log('Mongodb Correctamente conectado.');
					_mongoose.Promise = global.Promise;
					return true;
				}
		});
	}else{
		return true;
	}
}
let _indataraw = (im,dat) =>{
		let defer = q.defer();
		try{
			let raw_colecc 	= _mongoose.model((im+'_raws'), schemas.raw);
			let registro = new raw_colecc({
				imei: im,
				data: dat
			});
			registro.save((err2)=>{
				if(err2){
					console.log("#_indataraw #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indataraw CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indataraw #Error %s >> CATCH >> ",im);
			console.log(err3);
		}
}

let _indatatrack = (obj) =>{
		try{
			let track_colecc 	= _mongoose.model((obj.vh_nid+'_tracks'), schemas.track);
			let registro = new track_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indatatrack #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indatatrack CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indatatrack #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}

let _indatadevice = (obj) =>{
		try{
			let device_colecc 	= _mongoose.model((obj.vh_nid+'_devices'), schemas.device);
			let registro = new device_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indatadevice #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indatadevice CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indatadevice #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}

let _indatadin = (obj) =>{
		try{
			console.log(obj);
			let din_colecc 	= _mongoose.model((obj.vh_nid+'_dins'), schemas.din);
			let registro = new din_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indatadin #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indatadin CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indatadin #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}

let _indatageocerca = (obj) =>{
		try{
			let geocerca_colecc 	= _mongoose.model((obj.vh_nid+'_geocercas'), schemas.geocerca);
			let registro = new geocerca_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indatageocerca #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indatageocerca CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indatageocerca #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}

let _indatastopalert = (obj) =>{
		try{
			let stopalert_colecc 	= _mongoose.model((obj.vh_nid+'_paros'), schemas.paro);
			let registro = new stopalert_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indatastopalert #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indatastopalert CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indatastopalert #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}

let _indataspeed = (obj) =>{
		try{
			let speed_colecc 	= _mongoose.model((obj.vh_nid+'_speeds'), schemas.speed);
			let registro = new speed_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indataspeed #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indataspeed CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indataspeed #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}
let _indatasync = (obj) =>{
		try{
			let sync_colecc 	= _mongoose.model((obj.vh_nid+'_syncs'), schemas.sync);
			let registro = new sync_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indatasync #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indatasync CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indatasync #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}

let _indataevent = (obj) =>{
		try{
			let event_colecc 	= _mongoose.model((obj.vh_nid+'_events'), schemas.event);
			let registro = new event_colecc(obj);
			registro.save((err2)=>{
				if(err2){
					console.log("#_indataevent #Error %s >> SAVE >> fallida en NoSQL",err2);
				}else{
					if(logout){
						console.log("#_indataevent CORRECTO")
					}
				}
			});
		}catch(err3){
			console.log("#_indataevent #Error %s >> CATCH >> ",obj.vh_nid);
			console.log(err3);
		}
}


//**************************************************************
//				PLUGIN DESPACHO
//**************************************************************
// let _gettrackrecorrido = (obj) =>{
// 	let defer = q.defer();
// 	try{
// 		var ini = new Date(String(obj.inicio))
// 		var	fin = new Date(String(obj.final))
// 		//if (_conect()) {
// 			console.log(ini,'>>>',fin)
// 			let track_colecc 	= _mongoose.model((obj.vh_nid+'_tracks'), schemas.track);
// 			console.log('2')
// 			track_colecc.find(
// 				{
// 					GPStime : {
// 						$gte: ini,
// 						$lt: fin
// 					}
// 				}).sort({_id: 1}).exec(
// 					function(err1,data){
// 						if (err1) {
// 							console.log(err1)
// 							defer.reject({tipo:'Error',msg: "Error en la Consulta nosql #gettrackrecorrido"});
// 						}else{
// 							//console.log('nosql #gettrackrecorrido, data: ');
// 							console.log('ok')
// 							defer.resolve({tipo:'ok',proceso:'nosql #gettrackrecorrido', datos:data,horafin:obj.final});
// 						}
// 					}
// 				);

// 		// }else{
// 		// 	defer.reject({tipo:'Fail',msg: "No fue posible conectar a nsql. Informe Inmediatamente el codigo: #gettrackrecorrido"});
// 		// }
// 	}catch(err3){
// 		console.log("#gettrackrecorrido #Error %s >> CATCH >> ",err3);
// 		defer.reject({tipo:'Catch',msg: "#gettrackrecorrido #Error %s >> CATCH >> "+err3,obj:obj});
// 	}
// 	return defer.promise;
// }

let _gettrackrecorrido = (obj) =>{

	let defer = q.defer();
	try{
		var ini = new Date(String(obj.inicio))
		var	fin = new Date(String(obj.final))
		if (_conect()) {
			console.log(ini,'>>>',fin)
			let track_colecc 	= _mongoose.model((obj.vh_nid+'_tracks'), schemas.track);
			track_colecc.find(
				{
					GPStime : {
						$gte: ini,
						$lt: fin
					}
				}).sort({_id:1}).exec(function(err1,data){
				if (err1) {
					console.log(err1)
					defer.reject({tipo:'Error',msg: "Error en la Consulta nosql #gettrack"});
				}else{
					console.log('ok')
					//console.log('nosql #gettrack, data: ',data);
					defer.resolve({tipo:'ok',proceso:'nosql #gettrack', datos:data});
				}
			});

		}else{
			defer.reject({tipo:'Fail',msg: "No fue posible conectar a nsql. Informe Inmediatamente el codigo: #gettrack"});
		}
	}catch(err3){
		console.log("#gettrack #Error %s >> CATCH >> ",err3);
		defer.reject({tipo:'Catch',msg: "#gettrack #Error %s >> CATCH >> "+err3,obj:obj});
	}
	return defer.promise;
}

let _gethorasalidachp = (geoid,veh) =>{

	let defer = q.defer();
	try{
		//if (_conect()) {

			let geo_colecc 	= _mongoose.model((veh+'_geocercas'), schemas.track);
			geo_colecc.findOne({geoid:geoid},function(err1,data){
				if (err1) {
					defer.reject({tipo:'Error',msg: "Error en la Consulta nosql #gethorasalidachp"});
				}else{
					console.log('nosql #gethorasalidachp, data: ',data);
					defer.resolve({tipo:'ok',proceso:'nosql #gethorasalidachp', datos:data});
				}
			});

		// }else{
		// 	defer.reject({tipo:'Fail',msg: "No fue posible conectar a nsql. Informe Inmediatamente el codigo: #gethorasalidachp"});
		// }
	}catch(err3){
		console.log("#gethorasalidachp #Error %s >> CATCH >> ",err3);
		defer.reject({tipo:'Catch',msg: "#gethorasalidachp #Error %s >> CATCH >> "+err3,obj:obj});
	}
	return defer.promise;
}

module.exports = {
	saveraw: _indataraw,
	savetrack:_indatatrack,
	savedevice:_indatadevice,
	savedin:_indatadin,
	savegeocerca:_indatageocerca,
	savestopalert:_indatastopalert,
	savesync:_indatasync,
	saveevent:_indataevent,
	savespeed:_indataspeed,


	//*************************************************************8
	//				PLUGIN DESPACHO
	//**************************************************************
	gettrackrecorrido:_gettrackrecorrido,
	gethorasalidachp :_gethorasalidachp
};
