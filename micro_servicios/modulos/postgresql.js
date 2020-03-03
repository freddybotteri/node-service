'use strict';

const 	Pool	= require('pg').Pool,
		q		= require("q"),
		config	= require("./configs"),
		sql		= config.sqldb;
let 	format 		= 	require('pg-format');

let pool = new Pool(sql);

let _getEquipo = (parametro) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log('_getEquipo err1',err1);
			defer.reject({tipo:'Error',proceso:'getEquipo.Conect', datos:err1});
		}else{
			switch(parametro.tipo){
				case 'status'	:
					//console.log('aqui en get equipos status');\
					qrty = client.query("SELECT "+parametro.campos.join(',')+" FROM _vequipos WHERE eq_nsts =ANY($1)",[parametro.valores], stdCallback);
					break;
				case 'unique':
					//console.log('portgresql function get equipo- aqui en unique');
					qrty = client.query("SELECT "+parametro.campos.join(',')+" FROM _vequipos WHERE eq_nid =ANY($1)",[parametro.valores], stdCallback);
					break;
				case 'imei':
					qrty = client.query("SELECT "+parametro.campos.join(',')+" FROM _vequipos WHERE eq_vimei =ANY($1)",[parametro.valores], function(err,result){
						try{
							if(err) {
								defer.reject({tipo:'Error',proceso:'getEquipo.Query_'+parametro.tipo, datos:err});
								console.log(err);
							}else{
								let res = {};
								if(result.rowCount != '0'){
									for(let row in result.rows){
										res[row] = JSON.parse(JSON.stringify(result.rows[row]));
									}
									defer.resolve({tipo:'Ok',proceso:'getEquipo.'+parametro.tipo, datos:res});
								}else{
									defer.resolve({tipo:'Empty',proceso:'getEquipo.'+parametro.tipo, datos:{}});
								}
							}
							release();

						}catch(err3){
							defer.reject({tipo:'Error',proceso:'getEquipo.catch'+parametro.tipo, datos:err3});
						}
						return defer.promise;
					});
					break;
				default:
					if (parametro.sql) {
						qrty = client.query(parametro.sql, stdCallback);
					}
					break;
			}
		}
	});
	let stdCallback = (err, result)=>{
		try{
			//console.log('aqui en get equipos stdCallback');
			if(err) {
				defer.reject({tipo:'Error',proceso:'getEquipo.Query_'+parametro.tipo, datos:err});
				console.log(err);
			}else{
				let res = {};
				if(result.rowCount != '0'){
					for(let row in result.rows){
						res[row] = JSON.parse(JSON.stringify(result.rows[row]));
					}
					defer.resolve({tipo:'Ok',proceso:'getEquipo.'+parametro.tipo, datos:res});
				}else{
					defer.resolve({tipo:'Empty',proceso:'getEquipo.'+parametro.tipo, datos:{}});
				}
			}
			release();

		}catch(err3){
			defer.reject({tipo:'Error',proceso:'getEquipo.catch'+parametro.tipo, datos:err3});
		}
	};
	return defer.promise;
}
let _getGeoappdata = (parametro) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log('_getGeoappdata err1',err1);
			defer.reject({tipo:'Error',proceso:'getGeoappdata.Conect', datos:err1});
		}else{
			qrty = client.query('SELECT * FROM "_vgeossoftware" order by vh_nid', function(err,result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'getGeoappdata.Query_'+parametro.tipo, datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							let data = JSON.parse(JSON.stringify(result.rows));

							defer.resolve({tipo:'Ok',proceso:'getGeoappdata.'+parametro.tipo, datos:data});
						}else{
							defer.resolve({tipo:'Empty',proceso:'getGeoappdata.'+parametro.tipo, datos:{}});
						}
					}
					release();

				}catch(err3){
					defer.reject({tipo:'Error',proceso:'getGeoappdata.catch'+parametro.tipo, datos:err3});
				}
				return defer.promise;
			});
		}
	});
	return defer.promise;
}
let _getconfalertsdata = (parametro) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log('_getconfalertsdata err1',err1);
			defer.reject({tipo:'Error',proceso:'getconfalertsdata.Conect', datos:err1});
		}else{
			qrty = client.query('SELECT "public"."_tp_confalert".cfa_nid, "public"."_tp_confalert".use_nid, "public"."_tp_confalert".cfa_vobjcorreo, "public"."_tp_confalert".cfa_vobjvisual, "public"."_tp_confalert".cfa_vobjvoz, "public"."_tp_confalert".cfa_vvehspeed FROM "public"."_tp_confalert" ', function(err,result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'getconfalertsdata.Query_'+parametro.tipo, datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							let data = JSON.parse(JSON.stringify(result.rows));

							defer.resolve({tipo:'Ok',proceso:'getconfalertsdata.'+parametro.tipo, datos:data});
						}else{
							defer.resolve({tipo:'Empty',proceso:'getconfalertsdata.'+parametro.tipo, datos:{}});
						}
					}
					release();

				}catch(err3){
					defer.reject({tipo:'Error',proceso:'getconfalertsdata.catch'+parametro.tipo, datos:err3});
				}
				return defer.promise;
			});
		}
	});
	return defer.promise;
}
let _getalertsvehs = (parametro) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log('_getalertsvehs err1',err1);
			defer.reject({tipo:'Error',proceso:'getalertsvehs.Conect', datos:err1});
		}else{
			qrty = client.query('SELECT "public"."_tp_users".use_nid, "public"."_tp_confalert".cfa_nid, "public"."_tp_detflotilla".vh_nid,"public"."_tp_vehiculos".vh_vplaca,"public"."_tp_vehiculos".vh_vnombre FROM "public"."_tp_users" INNER JOIN "public"."_tp_confalert" ON "public"."_tp_confalert".use_nid = "public"."_tp_users".use_nid INNER JOIN "public"."_tp_flotillausuario" ON "public"."_tp_flotillausuario".use_nid = "public"."_tp_users".use_nid INNER JOIN "public"."_tp_flotillas" ON "public"."_tp_flotillausuario".fl_nid = "public"."_tp_flotillas".fl_nid INNER JOIN "public"."_tp_detflotilla" ON "public"."_tp_detflotilla".fl_nid = "public"."_tp_flotillas".fl_nid INNER JOIN "public"."_tp_vehiculos" ON "public"."_tp_detflotilla".vh_nid = "public"."_tp_vehiculos".vh_nid', function(err,result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'getalertsvehs.Query_'+parametro.tipo, datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							let data = JSON.parse(JSON.stringify(result.rows));

							defer.resolve({tipo:'Ok',proceso:'getalertsvehs.'+parametro.tipo, datos:data});
						}else{
							defer.resolve({tipo:'Empty',proceso:'getalertsvehs.'+parametro.tipo, datos:{}});
						}
					}
					release();

				}catch(err3){
					defer.reject({tipo:'Error',proceso:'getalertsvehs.catch'+parametro.tipo, datos:err3});
				}
				return defer.promise;
			});
		}
	});
	return defer.promise;
}

let _mergeubicaciones = (parametro) =>{
	let qrty;
	let defer = q.defer();
	//console.log('_mergeubicaciones parametro',parametro);
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log({tipo:'Error',proceso:'mergeUbic.Conect', datos:err1});
		}else{
			qrty = client.query("SELECT merge_ubicaciones($1,$2,$3::DECIMAL,$4::DECIMAL,$5::DECIMAL,$6::DECIMAL,$7::INTEGER,$8::DECIMAL,$9::DECIMAL,$10,$11,$12,$13,$14::DECIMAL,$15)",parametro, function(err,result){
				try{
					if(err) {
						console.log({tipo:'Error',proceso:'mergeUbic.Query_', datos:err});
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows));
							}
							//console.log('postgresql mergeUbic', res[0][0].merge_ubicaciones );
						}else{
							console.log({tipo:'Empty',proceso:'mergeUbic.', datos:{}});
						}
					}
					release();
				}catch(err3){
					console.log({tipo:'Error',proceso:'mergeUbic.catch', datos:err3});
				}
			});
		}
	});
}
let _savegeociclo = (parametro) =>{
	let qrty;
	let defer = q.defer();
	//console.log('_mergeubicaciones parametro',parametro);
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log({tipo:'Error',proceso:'_savegeociclo.Conect', datos:err1});
		}else{
			let qrystring = 'INSERT INTO "public"."_tp_geociclo" (geo_nid,vh_nid,plt_nid ,itl_nid,gcl_dini,gcl_vposini,gcl_dfin,gcl_vposfin,gcl_vtype) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
			qrty = client.query(qrystring,parametro, function(err,result){
				try{
					if(err) {
						console.log({tipo:'Error',proceso:'_savegeociclo.Query_', datos:err});
					}else{
						let res = {};
						if(result.rowCount != '0'){
							//console.log({tipo:'Ok',proceso:'_savegeociclo.', datos:result});
						}else{
							console.log({tipo:'Empty',proceso:'_savegeociclo.', datos:{}});
						}
					}
					release();
				}catch(err3){
					console.log({tipo:'Error',proceso:'_savegeociclo.catch', datos:err3});
				}
			});
		}
	});
}
//=========================================================================================
//								DESPACHOS
//=========================================================================================
let _getDatosdespacho = (tipo) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 desp',err1);
			defer.reject({tipo:'Error',proceso:'getEquipo.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			switch(tipo){
				case 'rutas'	:
					//console.log('aqui en get equipos status');
				qrty = client.query("select *,regexp_replace(regexp_replace(geo_vpath,\'}\',\']\',\'g\'),\'{\',\'[\',\'g\') as geo_vpath from _vdespachoservicerutas; UPDATE _td_rutas SET ru_benservicests = 1;", function(err, result){
						try{
							//console.log('aqui en get equipos stdCallback');

							if(err) {
								defer.reject({tipo:'Error',proceso:'getdespachosdatos', datos:err});
								console.log(err);
							}else{
								let res = {};
								if(result.rowCount != '0'){
									for(let row in result.rows){
										res[row] = JSON.parse(JSON.stringify(result.rows[row]));
									}
									defer.resolve({tipo:'Ok',proceso:'datosdespacho.', datos:res});
								}else{
									defer.resolve({tipo:'Empty',proceso:'datosdespacho.', datos:{}});
								}
							}
							release();

						}catch(err3){
							defer.reject({tipo:'Error',proceso:'getEquipo.catch', datos:err3});
						}
					});
				break;
				case 'despachos'	:
					//console.log('aqui en get equipos status');\
					qrty = client.query("SELECT * from _vdespachoservicedespachos; UPDATE _td_despacho SET de_benservicests = 1;", function(err, result){
						try{
							//console.log('aqui en get equipos stdCallback');

							if(err) {
								defer.reject({tipo:'Error',proceso:'getdespachosdatos', datos:err});
								console.log(err);
							}else{
								let res = {};
								if(result.rowCount != '0'){
									for(let row in result.rows){
										res[row] = JSON.parse(JSON.stringify(result.rows[row]));
									}
									defer.resolve({tipo:'Ok',proceso:'datosdespacho.', datos:res});
								}else{
									defer.resolve({tipo:'Empty',proceso:'datosdespacho.', datos:{}});
								}
							}
							release();

						}catch(err3){
							defer.reject({tipo:'Error',proceso:'getEquipo.catch', datos:err3});
						}
					});
				break;
				case 'checkpoint'	:
					//console.log('aqui en get equipos status');\
					qrty = client.query("SELECT chp_nid,chp_sts from _td_checkpoint where chp_enservice = 0; UPDATE _td_checkpoint SET chp_enservice = 1", function(err, result){
						try{
							if(err) {
								defer.reject({tipo:'Error',proceso:'getcheckpoint', datos:err});
								console.log(err);
							}else{
								let res = {};
								if(result.rowCount != '0'){
									for(let row in result.rows){
										res[row] = JSON.parse(JSON.stringify(result.rows[row]));
									}
									defer.resolve({tipo:'Ok',proceso:'getcheckpoint.', datos:res});
								}else{
									defer.resolve({tipo:'Empty',proceso:'getcheckpoint.', datos:{}});
								}
							}
							release();
						}catch(err3){
							defer.reject({tipo:'Error',proceso:'getcheckpoint.catch', datos:err3});
						}
					});
				break;
				case 'vehiculos'	:
					//console.log('aqui en get equipos status');
					qrty = client.query(`SELECT _tp_vehiculos.vh_nid,_tp_vehiculos.plt_nid,_tp_vehiculos.cia_nid,_tp_vehiculos.vh_vtipo,_tp_vehiculos.vh_dcrea,_tp_vehiculos.vh_vmodel,_tp_vehiculos.vh_vplaca,_tp_vehiculos.vh_vnombre,_tp_vehiculos.vh_vcolor,_tp_vehiculos.vh_vchasis,_tp_vehiculos.vh_vyear,_tp_vehiculos.vh_vin,_tp_vehiculos.vh_nsts,_tp_vehiculos.itl_nid
										FROM
											_tp_vehiculos
										INNER JOIN _td_despacho ON _tp_vehiculos.vh_nid = _td_despacho.vh_nid
										where _td_despacho.de_nsts in (0,1)`, function(err, result){
						try{
							if(err) {
								defer.reject({tipo:'Error',proceso:'vehiculos', datos:err});
								console.log(err);
							}else{
								let res = {};
								if(result.rowCount != '0'){
									for(let row in result.rows){
										res[row] = JSON.parse(JSON.stringify(result.rows[row]));
									}
									defer.resolve({tipo:'Ok',proceso:'vehiculos.', datos:res});
								}else{
									defer.resolve({tipo:'Empty',proceso:'vehiculos.', datos:{}});
								}
							}
							release();
						}catch(err3){
							defer.reject({tipo:'Error',proceso:'vehiculos.catch', datos:err3});
						}
					});
				break;
				case 'correos'	:
					//console.log('aqui en get equipos status');
					qrty = client.query(`select * from _td_correosdespacho`, function(err, result){
						try{
							if(err) {
								defer.reject({tipo:'Error',proceso:'correosdespacho', datos:err});
								console.log(err);
							}else{
								let res = {};
								if(result.rowCount != '0'){
									for(let row in result.rows){
										res[row] = JSON.parse(JSON.stringify(result.rows[row]));
									}
									defer.resolve({tipo:'Ok',proceso:'correosdespacho.', datos:res});
								}else{
									defer.resolve({tipo:'Empty',proceso:'correosdespacho.', datos:{}});
								}
							}
							release();
						}catch(err3){
							defer.reject({tipo:'Error',proceso:'correosdespacho.catch', datos:err3});
						}
					});
				break;
				default:
				break;
			}


		}
	});
	return defer.promise;
}
let _cambiarstsenservice = (id) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 cambiosts',err1);
			defer.reject({tipo:'Error',proceso:'getEquipo.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			qrty = client.query("UPDATE _td_rutas SET ru_benservicests = 1 where ru_nid = "+id+"", function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'cambiandoru_benservicests', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'ru_benservicests', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'ru_benservicests', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'getEquipo.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}

let _cambiarstsenservicedespacho = (id) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 cambio desp sts',err1);
			defer.reject({tipo:'Error',proceso:'despachoenserice.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			qrty = client.query("UPDATE _td_despacho SET de_benservicests = 1 where de_nid = "+id+"", function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'cambiandode_benservicests', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'deru_benservicests', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'de_benservicests', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'despachoenservice.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}

let _cambiarvelminmax = (iddesp,velmin,velmax,posmin,posmax) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 minmax',err1);
			defer.reject({tipo:'Error',proceso:'minmaxupdate.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			qrty = client.query("UPDATE _td_despacho SET de_nvelmax = $1 , de_nvelmin = $2,de_posmax = $3,de_posmin = $4 where de_nid = $5",[velmax,velmin,posmax,posmin,iddesp], function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'minmaxupdate', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'minmaxupdate', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'minmaxupdate', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'minmaxupdate.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}

let _guardardetalledespacho = (iddesp,druid,pos)=>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 detalle',err1);
			defer.reject({tipo:'Error',proceso:'creardetalledesp.Conect', datos:err1});

		}else{


			//console.log('aqui en get equipos status');\
			qrty = client.query("INSERT INTO _td_detalledespacho (de_nid,dru_nid) VALUES ($1,$2) RETURNING "+pos+" as pos,dte_nid,de_nid,dru_nid",[iddesp,druid], function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'creardetalledesp', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'creardetalledesp', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'creardetalledesp', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'creardetalledesp.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}

let _updatedetalledespacho = (iddetde,valor, campo)=>{
	console.log('para actualizar detalle depacho',iddetde,valor, campo)
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			///console.log('aqui en get equipos err1 pdate detalle',err1);
			defer.reject({tipo:'Error',proceso:'creardetalledesp.Conect', datos:err1});

		}else{


			//console.log('aqui en get equipos status');\
			qrty = client.query("UPDATE _td_detalledespacho SET "+campo+" = $1 where dte_nid = $2",[valor,iddetde], function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'creardetalledesp', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'creardetalledesp', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'creardetalledesp', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'creardetalledesp.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}

let _cambiarstsdespacho = (iddesp,sts) =>{
	console.log(iddesp,sts)
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 cambio sts desp',err1);
			defer.reject({tipo:'Error',proceso:'cambiostsdesp.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			qrty = client.query("UPDATE _td_despacho SET de_nsts = $1 where de_nid = $2",[sts,iddesp], function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'cambiostsdesp', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'cambiostsdesp', datos:result,sts:sts});
						}else{
							defer.resolve({tipo:'Empty',proceso:'cambiostsdesp', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'cambiostsdesp.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}
let _consultarposactual = (idveh) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 actual pos',err1);
			defer.reject({tipo:'Error',proceso:'consultarposactual.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			let sqlformat = format(`SELECT vh_nid,ubc_dhoraserver,ubc_nlatitud,ubc_nlongitud from _vvehpositions WHERE vh_nid
				in ( %L ) `,idveh)
			qrty = client.query(sqlformat, function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'consultarposactual', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'consultarposactual', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'consultarposactual', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'consultarposactual.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}

let _updatefechainifin = (iddesp,campo,value) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			console.log('update fecha ini fin',err1);
			defer.reject({tipo:'Error',proceso:'update ini fin.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			qrty = client.query("UPDATE _td_despacho SET "+campo+" = $1  where de_nid = $2",[value,iddesp], function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'update ini fin', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'update ini fin', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'update ini fin', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'update ini fin.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}
let _consultarultimodespterminado = (idveh) =>{
	let qrty;
	let defer = q.defer();
	//console.log('aqui en get equipos');
	pool.connect(function(err1, client, release) {
		if(err1) {
			//console.log('aqui en get equipos err1 actual pos',err1);
			defer.reject({tipo:'Error',proceso:'consultarultimodespterminado.Conect', datos:err1});

		}else{
			//console.log('aqui en get equipos status');\
			let sqlformat = `SELECT
									de_dfin
								FROM
									"_td_despacho"
								WHERE
									de_nid = (
										SELECT MAX (de_nid)
										FROM _td_despacho
										WHERE
											vh_nid = $1 AND de_nsts IN (4)
									)`;
			qrty = client.query(sqlformat,[idveh], function(err, result){
				try{
					if(err) {
						defer.reject({tipo:'Error',proceso:'consultarultimodespterminado', datos:err});
						console.log(err);
					}else{
						let res = {};
						if(result.rowCount != '0'){
							for(let row in result.rows){
								res[row] = JSON.parse(JSON.stringify(result.rows[row]));
							}
							defer.resolve({tipo:'Ok',proceso:'consultarultimodespterminado', datos:res});
						}else{
							defer.resolve({tipo:'Empty',proceso:'consultarultimodespterminado', datos:{}});
						}
					}
					release();
				}catch(err3){
					defer.reject({tipo:'Error',proceso:'consultarultimodespterminado.catch', datos:err3});
				}
			});
		}
	});
	return defer.promise;
}
module.exports = {
	getEquipo 			: 		_getEquipo,
	getGeoappdata 		: 		_getGeoappdata,
	mergeUbic 			: 		_mergeubicaciones,
	savegeociclo 		: 		_savegeociclo,
	getconfalertsdata 	: 		_getconfalertsdata,
	getalertsvehs 		: 		_getalertsvehs,
	//===================================================
	//				DESPACHOS
	//===================================================
	cambiarstsenservice 		: _cambiarstsenservice,
	Datosdespacho 				: _getDatosdespacho,
	cambiarstsenservicedespacho : _cambiarstsenservicedespacho,
	cambiarvelminmax 			: _cambiarvelminmax,
	guardardetalledespacho		: _guardardetalledespacho,
	updatedetalledespacho		: _updatedetalledespacho,
	cambiarstsdespacho 			: _cambiarstsdespacho,
	consultarposactual 			: _consultarposactual,
	updatefechainifin			: _updatefechainifin,
	consultarultimodespterminado : _consultarultimodespterminado
};



