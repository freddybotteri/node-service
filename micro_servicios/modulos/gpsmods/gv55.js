'use strict';
const	q			= require("q");
const	config		= require("./../configs");
const	queclink	= require("./../queclink");

//const	nosql		= require(config.nosqlhdl);

let		code 	=  queclink.gv55;

class gv55 {
	constructor(imei,comkey,socket,_vh_nid) {
		this.imei 		= imei;
		this.vh_nid 	= _vh_nid;
		this.socket 	= socket;
		this.comkey 	= comkey;
		this.eagleobj	= JSON.parse(JSON.stringify(config.eagleobj));
		this.geoobj		= JSON.parse(JSON.stringify(config.geoobj));
		this.dinobj		= JSON.parse(JSON.stringify(config.dinobj));
		this.devobj		= JSON.parse(JSON.stringify(config.devobj));
		this.syncobj 	= JSON.parse(JSON.stringify(config.syncobj));
		this.eventobj	= JSON.parse(JSON.stringify(config.eventobj));
		this.lasteagle 	= {}
	}
	decode(raw) {
		let defer 		= q.defer();
		try{
			//console.log('Dentro de gv55');
			let eagleobj		= JSON.parse(JSON.stringify(config.eagleobj)),
				geoobj			= JSON.parse(JSON.stringify(config.geoobj)),
				dinobj			= JSON.parse(JSON.stringify(config.dinobj)),
				devobj			= JSON.parse(JSON.stringify(config.devobj)),
				syncobj			= JSON.parse(JSON.stringify(config.syncobj)),
				eventobj		= JSON.parse(JSON.stringify(config.eventobj));

			this.lasteagle = JSON.parse(JSON.stringify(this.eagleobj));

			eagleobj.horaserver = new Date();
			geoobj.horaserver 	= new Date();
			dinobj.horaserver 	= new Date();
			devobj.horaserver 	= new Date();
			syncobj.horaserver 	= new Date();

			eagleobj.vh_nid = this.vh_nid;
			geoobj.vh_nid 	= this.vh_nid;
			dinobj.vh_nid 	= this.vh_nid;
			devobj.vh_nid 	= this.vh_nid;
			syncobj.vh_nid = this.vh_nid;

			let respuesta 	= [];

			if(raw.split(":")[0]=="+BUFF"){
				//raw = "+RESP:"+raw.split(":")[1];
				/**   se cambio ya que el gps manda un valor aveces. que contiene mas valores con : de lo esperado entonces arruina el resto del mensaje. ***/
				raw = raw.replace('BUFF','RESP');
			}
			let partes = raw.split(',');
			if (partes[0] in code) {
				let resfin = [];
				let objeto= code[partes[0]];
				for(let nam in objeto){
					if (nam in eagleobj) {
						eagleobj[nam] = partes[objeto[nam]];
					}
				}

				eagleobj["title"] = objeto["title"] ;
				eagleobj.postipo = 'real';//real, nula o ultima conocida (last)

				if (eagleobj.bateria == '') {
					if (this.eagleobj.bateria !='') {
						eagleobj.bateria = this.eagleobj.bateria;
					}
				};

				switch(partes[0]){
					case "+RESP:GTFRI":
						//si las posiciones vienen bien. IF
						//luego llenar los objetos eagle.
						let stat = partes[objeto['dstatus']].split('');
						let statant = stat[0]+stat[1];
						if (stat.length == 6) {
							let res  = this.statedec(statant);
							eagleobj["estadoequipo"] = res.estadoequipo;
							eagleobj["estadomotor"] = res.estadomotor;
						}else{
							if (eagleobj["velocidad"] > 0) {
								eagleobj["estadoequipo"]= 'ON';
							}
						}
						this.eagleobj = eagleobj; //lleno el eagleobj con la ultima posicion para pasarlas al anterior solo si la pos es real sino mantengo la anterior como real
						resfin.push("eagleobj");
						break;
					case "+RESP:GTTOW":
					case "+RESP:GTSPD":
					case "+RESP:GTRTL":
					case "+RESP:GTDOG":
					case "+RESP:GTIGL":
					case "+RESP:GTEXP":
					case "+RESP:GTERI":
					case "+RESP:GTMPN":
					case "+RESP:GTMPF":
					case "+RESP:GTBTC":
					case "+RESP:GTBPL":
					case "+RESP:GTIGN":
					case "+RESP:GTIGF":
					case "+RESP:GTSTR":
					case "+RESP:GTSTP":
					case "+RESP:GTLSP":
					case "+RESP:GTSTC":
					case "+RESP:GTSTT":
					case "+RESP:GTANT":
						// tipo eagle object
						eagleobj.postipo = 'even_'+partes[0].split(':GT')[1];
						if(!eagleobj.bateria){
							if (this.eagleobj.bateria) {
								eagleobj.bateria = this.eagleobj.bateria;
							}else{
								eagleobj.bateria = '0';
							}
						};
						this.eagleobj = eagleobj;
						resfin.push("eagleobj");
						break;

					case "+RESP:GTSOS":
					case "+RESP:GTDIS":
					case "+RESP:GTIOB":
						//aqui DIN
						dinobj["imei"] = partes[objeto['imei']];
						dinobj["title"] = objeto["title"];
						dinobj["nroent"] = partes[objeto['diostat']][0];
						dinobj["valent"] = partes[objeto['diostat']][1];
						this.eagleobj = eagleobj;
						this.dinobj = dinobj;
						resfin.push("eagleobj");
						resfin.push("dinobj");
						break;
					case "+RESP:GTDAT":
						//objeto dev pero con if si viene con posicion o solo data.
						devobj['title'] = objeto["title"];
						this.devobj = devobj;
						resfin.push("devobj");
					case "+RESP:GTHBM":
					case "+RESP:GTMON":
					case "+RESP:GTJDR":
					case "+RESP:GTJDS":
						//aqui tipo dev con posicion
						eventobj['title'] = objeto["title"];
						this.eventobj = eventobj;
						this.eagleobj = eagleobj;
						resfin.push("eagleobj");
						break;
					case "+RESP:GTINF":
					case "+RESP:GTPHD":
					case "+RESP:GTFSD":
						//tipo dev sin posicion
						syncobj["imei"] = partes[objeto['imei']];
						syncobj["title"] = objeto["title"];
						syncobj["SendTime"] = partes[objeto['SendTime']];
						this.syncobj = syncobj;
						resfin.push("syncobj");
						break;
					default:
						//RSPUESTA ACK +ACK:GTRTO,060800,862894020134436,gv55,RTL,FFFF,20110101003745,EE1E$
						//por defecto manda sync
						syncobj["imei"] = partes[2];
						syncobj["title"] = 'n/a';
						syncobj["SendTime"] = 'n/a';
						this.syncobj = syncobj;
						resfin.push("syncobj");
						console.log('NO TODAVIA',partes[0]);
						break;
				}

				defer.resolve({tipo:'Ok',proceso:'decode.raw',imei:this.imei, objetos:resfin, raw: raw });
			}else{
				if (partes[0].split(':')[0] == '+ACK' ) {
					defer.resolve({tipo:'ACK',proceso:'decode.raw',imei:this.imei, correlativo:partes[5], raw: raw });
				}else{
					defer.resolve({tipo:'N/A',proceso:'decode.raw',imei:this.imei, objetos:[], raw: raw });
				}
			}
		}catch(err){
			console.log('error en modulo gv55 catch decode',err);
			defer.reject({tipo:'Error',proceso:'decode.catch',imei:this.imei, err:err, objetos:[], raw: raw });
		}
		this.respsack(raw)
		return defer.promise;
	}
	statedec(inf){
		let resutl = {
			'estadoequipo' : 'OFF',
			'estadomotor' : 'OFF'
		}
		switch(inf){
			case '16'://tow
			case '1A'://fake tow
			case '12'://igni off- movi
			case '42'://sensor detect moti
				resutl["estadoequipo"]= 'ON';
				break;
			case '21'://ign on - rest
				resutl["estadomotor"]= 'ON';
				break;
			case '22'://ign on - mov
				resutl["estadomotor"]= 'ON';
				resutl["estadoequipo"]= 'ON';
				break;
			default:
				break;
		}
		return resutl;
	}
	respsack(raw){
		try{
			let count = raw.split(',')[raw.split(',').length-1];
			let sack = '';

			if(raw.toString().split(",")[0] == '+ACK:GTHBD '){
				sack= "+SACK:GTHBD,"+imei+","+count;
			}else{
				sack= "+SACK:"+count;
			}
			if (sack != '') {
				var databuffer= new Buffer(sack.trim());
				this.socket.send(databuffer, 0, databuffer.length, this.comkey.split(':')[1], this.comkey.split(':')[0],
					function( error, byteLength ) {
						if(error){
							console.log("Error en respsack.gv55", error, databuffer);
						}else{
							//console.log('respondido SACK');
						}
					}
				);
			}else{
				console.log("Error en sack respsack.gv55", sack);
			}

		}catch(err){
			console.log("Error catch respsack.gv55",err);
			console.log("********************************************************************");
		}
	}
	sendcommand(command){
		let defer = q.defer();
		try{
			var databuffer= new Buffer(command.trim());
			this.socket.send(databuffer, 0, databuffer.length, this.comkey.split(':')[1], this.comkey.split(':')[0],
				function( error, byteLength ) {
					if(error){
						console.log("Error en sendcommand.gv55", error, databuffer);
						defer.reject({tipo:'Error',proceso:'sendcommand.gv55',comkey:this.comkey, objetos:err});
					}else{
						console.log("Ok en sendcommand.gv55");
						defer.resolve({tipo:'Ok',proceso:'sendcommand.gv55',comkey:this.comkey });
					}
				}
			);
		}catch(err){
			console.log("Error catch sendcommand.gv55",err);
			console.log("********************************************************************");
			defer.reject({tipo:'Error',proceso:'sendcommand.catch',comkey:this.comkey, objetos:err});
		}
		return defer.promise;
	}
}

module.exports =  gv55;
