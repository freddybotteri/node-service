"use strict";

const fs 			= require('fs');
const nodemailer 	= require('nodemailer');

let		database 			=	require("../postgresql.js");
let 	communicator		=	require('../communicator.js');
let 	configpath 			=	require('../configs.js');
let		nosql 				=	require("../nosql/mongodb.js");
let		geomod;

setTimeout(function(){
	geomod 		=	require("./geomod.js");
},1000);

let 	ram;
//variables de control de timer para la carga.
let 	conttimer = {
	crono 		: null,
	firstcall	: null
}
let posbuffer  = {};

let tiposdealertas ={
	speed	: 1,
	Geo		: 2,
	stop	: 3,
	event	: 4
}
let nombredealertas ={
	1 : "Alerta de Velocidad",
	2 : "Geocerca",
	3 : "Paros",
	4 : "Eventos"
}
let transporter;

try{

	fs.exists('./alertmod_cache.json', function(exists){
		if (exists) {
			_readfile('./alertmod_cache.json')
		}else{
			fs.exists(configpath.serverpath+'/modulos/appsmods/alertmod_cache.json', function(exists){
				if (exists) {
					_readfile(configpath.serverpath+'/modulos/appsmods/alertmod_cache.json')
				}
			})
		}
	})

	transporter = nodemailer.createTransport({
		host: '',
		port: 26,
		tls:{
			rejectUnauthorized: false,
		},
		auth: {
		}
	});

}catch(err){
	console.log('carga de cache fallida',err);
	console.log('aqui voy a mandar a _load inst cant read file')
	_load('inst');
}


let _readfile = (__path)=>{
	fs.readFile(__path, 'utf8', function (err, data) {
		if (err){
			console.log('carga de cache fallida 1',err);
		}else{
			try{
				ram = JSON.parse(data);
			}catch(errz){
				console.log('JSON.parse(data)',errz);
			}
		}

		if (typeof ram === 'object') {
			if (!('vehiculos' in ram)) {
				console.log('aqui voy a mandar a _load inst vehiculos no in ram')
				_load('inst');
			}
		}else{
			console.log('aqui voy a mandar a _load inst ram is no objeto')
			_load('inst');
		}
	});
}
// en cola de carga por tiempo desde 3 hasta 15 minutos. o instantaneo.
let _load = (tipo)=>{
	console.log('aqui en _load',tipo);
	if (tipo == 'inst') {
		__load();
	}else{
		clearTimeout(conttimer.crono);
		if (conttimer.firstcall != null) {
			if(((new Date()) - conttimer.firstcall) > 900000){
				__load();
				return;
			}
		}else{
			conttimer.firstcall = new Date();
		}

		conttimer.crono = setTimeout(__load,180000);
	}
}
//funcion de carga de base de datos y prellenado de la ram.
let __load =()=>{
	console.log('DENTRO DE _load !!!');
	clearTimeout(conttimer.crono);
	conttimer.firstcall	 = null;

	database.getconfalertsdata({tipo : 'getconfalerts'}).then(function (resp){
		try{
			if (typeof ram === 'object') {

				if ('vehiculos' in ram) {
					ram.vehiculos = {};
				}else{
					ram['vehiculos'] = {}
				}

				if ('vehsalert' in ram) {
					ram.vehsalert = {};
				}else{
					ram['vehsalert'] = {}
				}

				if ('statusveh' in ram) {
				}else{
					ram['statusveh'] = {};
				}

				if ('vehsmails' in ram) {
					ram.vehsmails = {};
				}else{
					ram['vehsmails'] = {};
				}

				if ('vocales' in ram) {
					ram.vocales = {};
				}else{
					ram['vocales'] = {};
				}

				if ('visuales' in ram) {
					ram.visuales = {};
				}else{
					ram['visuales'] = {};
				}

			}else{

				ram = {
					vehiculos 	: {},
					vehsalert 	: {},
					statusveh 	: {},
					vehsmails 	: {},
					vocales 	: {},
					visuales 	: {}
				}
			}

			if (resp.tipo == 'Ok') {
					for (let i in resp.datos) {
						let _data = resp.datos[i];

						let cfa_vvehspeed = JSON.parse(_data.cfa_vvehspeed),
							cfa_vobjcorreo = JSON.parse(_data.cfa_vobjcorreo),
							cfa_vobjvoz = JSON.parse(_data.cfa_vobjvoz),
							cfa_vobjvisual = JSON.parse(_data.cfa_vobjvisual);

						for(let vhs in cfa_vvehspeed){

							if (vhs in ram.vehiculos) {

								if ( cfa_vvehspeed[vhs].s in ram.vehiculos[vhs].velocidad ) {

									if ( _data.cfa_nid in ram.vehiculos[ vhs ].velocidad[ cfa_vvehspeed[vhs].s ].configuraciones ) {
										//ya esta todo esto...
									}else{
										ram.vehiculos[ vhs ].velocidad[ cfa_vvehspeed[vhs].s ].configuraciones[ _data.cfa_nid ] = _data.cfa_nid;
									}

								}else{

									ram.vehiculos[vhs].velocidad[ cfa_vvehspeed[vhs].s ] = {
										"configuraciones":{}
									};

									ram.vehiculos[ vhs ].velocidad[ cfa_vvehspeed[vhs].s ].configuraciones[ _data.cfa_nid ] = _data.cfa_nid;
								}
							}else{

								ram.vehiculos[ vhs ] = {
									"velocidad" :{}
								};

								ram.vehiculos[vhs].velocidad[ cfa_vvehspeed[vhs].s ] = {
									"configuraciones":{}
								};

								ram.vehiculos[ vhs ].velocidad[ cfa_vvehspeed[vhs].s ].configuraciones[ _data.cfa_nid ] = _data.cfa_nid;

							}
						}
						for(let mail in cfa_vobjcorreo){
							if (!(_data.cfa_nid in ram.vehsmails)) {
								ram.vehsmails[_data.cfa_nid] = {
									cfa_nid: _data.cfa_nid,
									user : _data.use_nid,
									perfil : {}
								}
							}
							ram.vehsmails[_data.cfa_nid].perfil[mail] = {
								maler : mail,
								name : cfa_vobjcorreo[mail].maler_vtipo,
								status : cfa_vobjcorreo[mail].status,
								mails  : cfa_vobjcorreo[mail].emails
							}
						}
						for(let vis in cfa_vobjvisual){
							if (!(_data.cfa_nid in ram.visuales)) {
								ram.visuales[_data.cfa_nid] = {
									cfa_nid: _data.cfa_nid,
									user : _data.use_nid,
									perfil : {}
								}
							}
							ram.visuales[_data.cfa_nid].perfil[vis] = {
								maler : vis,
								status : cfa_vobjvisual[vis].status
							}
						}
						for(let voz in cfa_vobjvoz){
							if (!(_data.cfa_nid in ram.vocales)) {
								ram.vocales[_data.cfa_nid] = {
									cfa_nid: _data.cfa_nid,
									user : _data.use_nid,
									perfil : {}
								}
							}
							ram.vocales[_data.cfa_nid].perfil[voz] = {
								maler : voz,
								status : cfa_vobjvoz[voz].status
							}
						}
					}
			}else{
				console.log('un error a ocurrido getconfalerts',resp);
			};

			database.getalertsvehs({ tipo : 'getalertsvehs' }).then(function (resp){
				if (resp.tipo == 'Ok') {
					for (let i in resp.datos) {
						let _data = resp.datos[i];
						if (!(_data.vh_nid in ram.vehsalert)) {
							ram.vehsalert[_data.vh_nid] = {
								vh_vplaca	: _data.vh_vplaca,
								vh_vnombre	: _data.vh_vnombre,
								perfil : {}
							}
						}
						ram.vehsalert[_data.vh_nid].perfil[_data.cfa_nid] = {
							cfa_nid : _data.cfa_nid,
							use_nid : _data.use_nid
						}
					}
				}else{
					console.log('un error a ocurrido getalertsvehs',resp);
				}
				_savecahe()
			});
		}catch(err){
			console.log(err)
		}
	});
}

let _savecahe = (check)=>{
	try{
		fs.exists('./alertmod_cache.json', function(exists){
			if (exists) {
				var _json = JSON.stringify(ram);
				fs.writeFile('./alertmod_cache.json', _json, function(err) {
						if(err) {
							console.log('error en _savecache alertmod');
							return;
						}
					});
			}else{
				fs.exists(configpath.serverpath+'/modulos/appsmods/alertmod_cache.json', function(exists2){
					if (exists2) {
						var _json = JSON.stringify(ram);
						fs.writeFile(configpath.serverpath+'/modulos/appsmods/alertmod_cache.json', _json, function(err) {
							if(err) {
								console.log('error en _savecache alertmod');
								return;
							}
						});
					}else{
						console.log('reintentar guardar archivo 2' );
					}
				})
			}
		})
	}catch(err){
		console.log('error al guardar cache',err);
	}
}

let formatdateobj = (gpstime,offset)=>{
	if(typeof gpstime != "undefined"){
		try{
			if ((typeof offset) === "undefined") {
				offset = -6;
			}
			var ltime=new Date();

			if ((typeof gpstime) === "object") {
				ltime = new Date(gpstime);
			}

			if(Math.abs(offset)>0){
				ltime.setHours(ltime.getHours()+offset);
			}

			return ltime;

		}catch(ex){
			console.log("Invalid datetime in formatdateobj at stopmod %s ",gpstime,ex);
			console.log("********************************************************************");

			var ltime=new Date();
			ltime.setHours(ltime.getHours()-6);
			return ltime;
		}
	}else{
		var ltime=new Date();
		ltime.setHours(ltime.getHours()-6);
		return ltime;
	}
}

let difftime = (time1,time2)=>{
	var ltime1 =new Date(time1);
	var ltime2  =new Date(time2);
	return ((ltime2.getTime() - ltime1.getTime()) / 1000);
}

let datestring = (date,offset)=>{

	var mes = {
		'01':'Ene',
		'02':'Fb',
		'03':'Mar',
		'04':'Abr',
		'05':'May',
		'06':'Jun',
		'07':'Jul',
		'08':'Ago',
		'09':'Sep',
		'10':'Oct',
		'11':'Nov',
		'12':'Dic'
	}

	function pad(number){
		if (number < 10) {
			return '0' + number;
			}
			return number;
	}

	let _date;

	if ((typeof date) === "object") {
		_date = date;
	}else{
		_date = new Date(date);
	}

	if(offset){
		_date.setHours(_date.getHours()+offset);
	}
	let ret = pad(_date.getHours()) +
		':' + pad(_date.getMinutes()) +
		':' + pad(_date.getSeconds()) +
		' ' + pad(_date.getDate()) +
		'/' + mes[pad(_date.getMonth() + 1)] +
		'/' + _date.getFullYear().toString().substring(2,4);

	return ret;
}

let toHHMMSS = (secs)=>{
	var sec_num = parseInt(secs, 10)
	var hours   = Math.floor(sec_num / 3600) % 24
	var minutes = Math.floor(sec_num / 60) % 60
	var seconds = sec_num % 60
	return [hours,minutes,seconds]
		.map(v => v < 10 ? "0" + v : v)
		.filter((v,i) => v !== "00" || i > 0)
		.join(":")
}

let dumpError = (err)=>{
  if (typeof err === 'object') {
    if (err.message) {
      console.log('\nMessage: ' + err.message)
    }
    if (err.stack) {
      console.log('\nStacktrace:')
      console.log('====================')
      console.log(err.stack);
    }
  } else {
    console.log('dumpError :: argument is not an object');
  }
}

let htmlmailout = (evento,placa,detalles,lat,lon)=>{
	return `<!DOCTYPE html>
		<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
		<head>
			<meta charset="utf-8"> <!-- utf-8 works for most cases -->
			<meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
			<meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
			<meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
			<title>Evento - Tivitrace</title> <!-- The title tag shows in email notifications, like Android 4.4. -->

			<!-- Web Font / @font-face : BEGIN -->
			<!-- NOTE: If web fonts are not required, lines 10 - 27 can be safely removed. -->

			<!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
			<!--[if mso]>
				<style>
					* {
						font-family: Arial, sans-serif !important;
					}
				</style>
			<![endif]-->

			<!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
			<!--[if !mso]><!-->
				<link href="https://fonts.googleapis.com/css?family=Montserrat:300,500" rel="stylesheet">
			<!--<![endif]-->

			<!-- Web Font / @font-face : END -->

			<!-- CSS Reset -->
			<style>

				/* What it does: Remove spaces around the email design added by some email clients. */
				/* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
				html,
				body {
					margin: 0 auto !important;
					padding: 0 !important;
					height: 100% !important;
					width: 100% !important;
				}

				/* What it does: Stops email clients resizing small text. */
				* {
					-ms-text-size-adjust: 100%;
					-webkit-text-size-adjust: 100%;
				}

				/* What it does: Centers email on Android 4.4 */
				div[style*="margin: 16px 0"] {
					margin:0 !important;
				}

				/* What it does: Stops Outlook from adding extra spacing to tables. */
				table,
				td {
					mso-table-lspace: 0pt !important;
					mso-table-rspace: 0pt !important;
				}

				/* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
				table {
					border-spacing: 0 !important;
					border-collapse: collapse !important;
					table-layout: fixed !important;
					margin: 0 auto !important;
				}
				table table table {
					table-layout: auto;
				}

				/* What it does: Uses a better rendering method when resizing images in IE. */
				img {
					-ms-interpolation-mode:bicubic;
				}

				/* What it does: A work-around for email clients meddling in triggered links. */
				*[x-apple-data-detectors],	/* iOS */
				.x-gmail-data-detectors, 	/* Gmail */
				.x-gmail-data-detectors *,
				.aBn {
					border-bottom: 0 !important;
					cursor: default !important;
					color: inherit !important;
					text-decoration: none !important;
					font-size: inherit !important;
					font-family: inherit !important;
					font-weight: inherit !important;
					line-height: inherit !important;
				}

				/* What it does: Prevents Gmail from displaying an download button on large, non-linked images. */
				.a6S {
					display: none !important;
					opacity: 0.01 !important;
				}
				/* If the above doesn't work, add a .g-img class to any image in question. */
				img.g-img + div {
					display:none !important;
				   }

				/* What it does: Prevents underlining the button text in Windows 10 */
				.button-link {
					text-decoration: none !important;
				}

				/* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
				/* Create one of these media queries for each additional viewport size you'd like to fix */
				/* Thanks to Eric Lepetit @ericlepetitsf) for help troubleshooting */
				@media only screen and (min-device-width: 375px) and (max-device-width: 413px) { /* iPhone 6 and 6+ */
					.email-container {
						min-width: 375px !important;
					}
				}

			</style>

			<!-- Progressive Enhancements -->
			<style>

				/* What it does: Hover styles for buttons */
				.button-td,
				.button-a {
					transition: all 100ms ease-in;
				}
				.button-td:hover,
				.button-a:hover {
					background: #555555 !important;
					border-color: #555555 !important;
				}

				/* Media Queries */
				@media screen and (max-width: 480px) {

					/* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
					.fluid {
						width: 100% !important;
						max-width: 100% !important;
						height: auto !important;
						margin-left: auto !important;
						margin-right: auto !important;
					}

					/* What it does: Forces table cells into full-width rows. */
					.stack-column,
					.stack-column-center {
						display: block !important;
						width: 100% !important;
						max-width: 100% !important;
						direction: ltr !important;
					}
					/* And center justify these ones. */
					.stack-column-center {
						text-align: center !important;
					}

					/* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
					.center-on-narrow {
						text-align: center !important;
						display: block !important;
						margin-left: auto !important;
						margin-right: auto !important;
						float: none !important;
					}
					table.center-on-narrow {
						display: inline-block !important;
					}

					/* What it does: Adjust typography on small screens to improve readability */
					.email-container p {
						font-size: 17px !important;
						line-height: 22px !important;
					}
				}

			</style>

			<!-- What it does: Makes background images in 72ppi Outlook render at correct size. -->
			<!--[if gte mso 9]>
			<xml>
				<o:OfficeDocumentSettings>
					<o:AllowPNG/>
					<o:PixelsPerInch>96</o:PixelsPerInch>
				</o:OfficeDocumentSettings>
			</xml>
			<![endif]-->

		</head>
		<body width="100%" bgcolor="#F1F1F1" style="margin: 0; mso-line-height-rule: exactly;">
			<center style="width: 100%; background: #F1F1F1; text-align: left;">

				<!-- Visually Hidden Preheader Text : BEGIN -->
				<div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family: sans-serif;">
					Evento Tivitrace
				</div>
				<!-- Visually Hidden Preheader Text : END -->
				<div style="max-width: 880px; margin: auto;" class="email-container">
					<!--[if mso]>
					<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="680" align="center">
					<tr>
					<td>
					<![endif]-->

					<!-- Email Body : BEGIN -->
					<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px;" class="email-container">


						<!-- HEADER : BEGIN -->
						<tr>
							<td bgcolor="#333333">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 30px 40px 30px 40px; text-align: center;">
											<h1 style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 15px; line-height: 36px; color: #ffffff; font-weight: bold;">TIVITRACE</h1>
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<!-- HEADER : END -->

						<!-- HERO : BEGIN -->
						<tr>
							<!-- Bulletproof Background Images c/o https://backgrounds.cm -->
							<td  bgcolor="#222222" align="center" valign="top" style="text-align: center; background-position: center center !important; background-size: cover !important;">
								<!--[if gte mso 9]>
								<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px; height:380px; background-position: center center !important;">
								<v:fill type="tile" src="background.png" color="#222222" />
								<v:textbox inset="0,0,0,0">
								<![endif]-->
								<div>
									<!--[if mso]>
									<table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" width="500">
									<tr>
									<td align="center" valign="middle" width="500">
									<![endif]-->
									<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="max-width:500px; margin: auto;">

										<tr>
											<td height="20" style="font-size:20px; line-height:20px;">&nbsp;</td>
										</tr>

										<tr>
										  <td align="center" valign="middle">

										  <table>
											 <tr>
												 <td valign="top" style="text-align: center; padding: 60px 0 10px 20px;">

													 <h1 style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 30px; line-height: 36px; color: #ffffff; font-weight: bold;">`+evento+` <br> `+placa+`</h1>
												 </td>
											 </tr>
											 <tr>
												 <td valign="top" style="text-align: center; padding: 10px 20px 15px 20px; font-family: sans-serif; font-size: 15px; line-height: 20px; color: #E6E6E6;">
													 <p style="margin: 0;">
													 	`+detalles+`
													 </p>
												 </td>
											 </tr>
											 <tr>
												 <td valign="top" align="center" style="text-align: center; padding: 15px 0px 60px 0px;">

													 <!-- Button : BEGIN -->
													 <center>
													 <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" class="center-on-narrow" style="text-align: center;">
														 <tr>
															 <td style="border-radius: 50px; background: #26a4d3; text-align: center;" class="button-td">

															 </td>
														 </tr>
													 </table>
													 </center>
													 <!-- Button : END -->

												 </td>
											 </tr>
										  </table>

										  </td>
										</tr>

										<tr>
											<td height="20" style="font-size:20px; line-height:20px;">&nbsp;</td>
										</tr>

									</table>
									<!--[if mso]>
									</td>
									</tr>
									</table>
									<![endif]-->
								</div>
								<!--[if gte mso 9]>
								</v:textbox>
								</v:rect>
								<![endif]-->
							</td>
						</tr>
						<!-- HERO : END -->
						<tr>
							<td>
								<center>
									<a href="https://www.google.com/maps/place/`+lat+`,+`+lon+`/"><img src="https://maps.googleapis.com/maps/api/staticmap?center=`+lat+`,+`+lon+`&zoom=14&scale=false&size=700x400&maptype=hybrid&format=png&visual_refresh=true&markers=`+lat+`,+`+lon+`" alt="Mapa de `+lat+`, `+lon+`"></a>
								</center>
							</td>
						</tr>
						<!-- FOOTER : BEGIN -->
						<tr>
							<td bgcolor="#ffffff">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 40px 40px 10px 40px; font-family: sans-serif; font-size: 12px; line-height: 18px; color: #666666; text-align: center; font-weight:normal;">
											<p style="margin: 0;">www.tivitrace.com</p>
										</td>
									</tr>
									<tr>
										<td style="padding: 0px 40px 10px 40px; font-family: sans-serif; font-size: 12px; line-height: 18px; color: #666666; text-align: center; font-weight:normal;">
											<p style="margin: 0;">Este correo Fue Enviado Automaticamente, favor no contestar a esta direccion,</p>
										</td>
									</tr>
									<tr>
										<td style="padding: 0px 40px 10px 40px; font-family: sans-serif; font-size: 12px; line-height: 18px; color: #666666; text-align: center; font-weight:normal;">
											<p style="margin: 0;">Para cualquier Consulta, hacerla al correo info@tivitrace.com</p>
										</td>
									</tr>
									<tr>
										<td style="padding: 0px 40px 40px 40px; font-family: sans-serif; font-size: 12px; line-height: 18px; color: #666666; text-align: center; font-weight:normal;">
											<p style="margin: 0;">Copyright &copy; 2017 <br> <b>TiviTrace Developer Group</b><br> All Rights Reserved.</p>
										</td>
									</tr>

								</table>
							</td>
						</tr>
						<!-- FOOTER : END -->

					</table>
					<!-- Email Body : END -->

					<!--[if mso]>
					</td>
					</tr>
					</table>
					<![endif]-->
				</div>

			</center>
		</body>
		</html>`
}

let sentmail =(objeto,use_nid,correos,cfa_nid,indxtype,extarg)=>{
	// setup email data with unicode symbols
	let evento = nombredealertas[indxtype];
	let placa = ram.vehsalert[objeto.vh_nid].vh_vplaca;
	let detalles = '';
 	let lat,lon;
	switch(indxtype){
		case 1:
			//velocidades
			detalles = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" Transito sobre el Nivel establecido de velocidad de "+extarg+" Km/h Durante "+toHHMMSS(objeto.timein)+" Segundos";
			lat = objeto.latlon1.split(',')[0];
			lon = objeto.latlon1.split(',')[1];
			break;
		case 2:
			//geocercas
			detalles = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" "+(objeto.geoevent == "out"?"Salio a ":"Ingreso a ")+extarg+"  a las "+datestring(objeto.GPStime,6);
			lat = objeto.latlon[0];
			lon = objeto.latlon[1];
			break;
		case 3:
			//paros
			detalles = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" Se detuvo durante "+toHHMMSS(objeto.timein)+" desde "+datestring(objeto.GPStimein,6)+" hasta "+datestring(objeto.GPStimeout,6);
			lat = objeto.latlon.split(',')[0];
			lon = objeto.latlon.split(',')[1];
			break;
		case 4:
			//eventos
			detalles = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" reporto un Evento tipo "+objeto.tipo+" a las "+datestring(objeto.GPStime,6);
			lat = objeto.latlon.split(',')[0];
			lon = objeto.latlon.split(',')[1];
			break;
	}

	let mailOptions = {
		from: '"TiviTrace 📡" <alerta@tivitrace.com>', // sender address
		to: correos, // list of receivers
		subject: 'Evento Tivitrace', // Subject line
		text: evento+' '+placa+' '+detalles, // plain text body
		html: htmlmailout(evento,placa,detalles,lat,lon) // html body
	};

    // send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}else{
			 console.log('Message sent: ' + info.response + '==>'+correos);
		}
	});
}

let sentvisualovocal =(visovoc,objeto,use_nid,cfa_nid,indxtype,extarg)=>{
	//Alertas visuales o auditivas para la plataforma. con el modulo transporter.
	let mensaje = '';
	switch(indxtype){
		case 1:
			//velocidades
			mensaje = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" Transitó sobre el Nivel establecido de velocidad de "+extarg+" Km/h Durante "+toHHMMSS(objeto.timein)+" En *"+objeto.latlon1.split(',')[0]+","+objeto.latlon1.split(',')[1];
			break;
		case 2:
			//geocercas
			mensaje = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" "+(objeto.geoevent == "out"?"Salio a ":"Ingreso a ")+extarg+"  a las "+datestring(objeto.GPStime,6)+" En *"+objeto.latlon[0]+","+objeto.latlon[1];
			break;
		case 3:
			//paros
			mensaje = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" Se detuvo durante "+toHHMMSS(objeto.timein)+" desde "+datestring(objeto.GPStimein,6)+" hasta "+datestring(objeto.GPStimeout,6)+" En *"+objeto.latlon.split(',')[0]+","+objeto.latlon.split(',')[1];
			break;
		case 4:
			//eventos
			mensaje = "La Unidad "+(objeto.vh_nid in ram.vehsalert? ram.vehsalert[objeto.vh_nid].vh_vnombre+'- '+ram.vehsalert[objeto.vh_nid].vh_vplaca:"" )+" reporto un Evento tipo "+objeto.tipo+" a las "+datestring(objeto.GPStime,6)+" En *"+objeto.latlon.split(',')[0]+","+objeto.latlon.split(',')[1];
			break;
	}
 	communicator.socketIO.emit('msgtoroom',{ 'room':objeto.imei, 'alertmod': mensaje,'type': visovoc, 'use_nid':use_nid});

}
let iniciospeed = (objeto,_idvh,vellimit,configs,objbuffer)=>{
	//console.log('iniciospeed',objeto,_idvh);
	try{

		let geosstat = geomod.checkve(_idvh);

		let ingeos = [];

		for(let _geo in geosstat ){
			if (geosstat[_geo].status == 'in'){
				ingeos.push(_geo);
			}
		}

		if (!(_idvh in ram.statusveh)) {
			ram.statusveh[_idvh] = {
				limites : {}
			}
		}

		ram.statusveh[_idvh].limites[vellimit] = {
			"vh_nid"		: objeto.vh_nid,
			"imei" 			: objeto.imei,
			"tipo" 			: "speed",
			"title" 		: objeto.title,
			"config" 		: configs,
			"geosin" 		: ingeos,
			"timein" 		: '--:--:--',
			"objspos" 		: [],
			"GPStimein" 	: formatdateobj(objeto.GPStime,-6),
			"GPStimeout" 	: '',
			"latlon1" 		: objeto.latitud+','+objeto.longitud,
			"latlon2" 		: 0+','+0,
			"horaserver" 	: new Date()
		}



		if (objbuffer) {
			ram.statusveh[_idvh].limites[vellimit].objspos.push([objbuffer.velocidad,objbuffer.latitud+','+objbuffer.longitud, formatdateobj(objbuffer.GPStime,-6)])
		}
		ram.statusveh[_idvh].limites[vellimit].objspos.push([objeto.velocidad,objeto.latitud+','+objeto.longitud, formatdateobj(objeto.GPStime,-6)])
		//console.log(_idvh,ram.statusveh[_idvh]);
		_savecahe();
	}catch(er){
		dumpError(er)
	}
}

let finspeed = (objeto,_idvh,vellimit)=>{
	//console.log('finspeed',objeto,_idvh,config);
	try{
		if (_idvh in ram.statusveh) {
			if ("objpos" in ram.statusveh[_idvh].limites[vellimit]) {
				ram.statusveh[_idvh].limites[vellimit].objspos.push([objeto.velocidad,objeto.latitud+','+objeto.longitud, formatdateobj(objeto.GPStime,-6)]);
			}

			let date2 = formatdateobj(objeto.GPStime,-6)


			ram.statusveh[_idvh].limites[vellimit].timein 		= difftime(ram.statusveh[_idvh].limites[vellimit].GPStimein,date2);
			ram.statusveh[_idvh].limites[vellimit].GPStimeout 	= formatdateobj(objeto.GPStime,-6);
			ram.statusveh[_idvh].limites[vellimit].latlon2 		= objeto.latitud+','+objeto.longitud;

			nosql.savespeed(ram.statusveh[_idvh].limites[vellimit]);

			_alert( ram.statusveh[_idvh].limites[vellimit], vellimit);


			delete ram.statusveh[_idvh].limites[vellimit];
			_savecahe();
		}
	}catch(er){
		dumpError(er)
	}
}

let _work = (objeto) =>{
	try{
		//si es un vehiculo en observacion
		if (objeto.vh_nid in ram.vehiculos) {
			//si hay una bandera para este vehiculo
			if (objeto.vh_nid in ram.statusveh) {

				//el carro ya tiene una bandera de velocidad
				//para cada bandera revisar si sigue fuera del limite
				for(let vellimit in ram.statusveh[objeto.vh_nid].limites){

					if (Number(vellimit) > Number(objeto.velocidad)) {
						//si la velocidad esta arriba de la bandera
						//le pongo la nueva posicion del arreglo
						if ("objpos" in ram.statusveh[objeto.vh_nid]) {
							ram.statusveh[objeto.vh_nid].limites[vellimit].objspos.push(
								[objeto.velocidad,objeto.latitud+','+objeto.longitud,
								formatdateobj(objeto.GPStime,-6)]
							);
						}

					}else{
						//ya no esta fuera del limite de velocidad
						// enviar a finalizar esta bandera.
						finspeed(objeto,objeto.vh_nid,vellimit)
					}
				}

				for(let velflag in ram.vehiculos[objeto.vh_nid].velocidad){
					if (!(velflag in ram.statusveh[objeto.vh_nid].limites)) {
						if (Number(velflag) > Number(objeto.velocidad)) {
							//esta nueva bandera se cumple
							iniciospeed(objeto,objeto.vh_nid,velflag,ram.vehiculos[objeto.vh_nid].velocidad[velflag].configuraciones,(objeto.vh_nid in posbuffer?JSON.parse(JSON.stringify(posbuffer[objeto.vh_nid])):false))
						}
					}
				}

			}else{
				for(let velflag in ram.vehiculos[objeto.vh_nid].velocidad){

					if (Number(velflag) > Number(objeto.velocidad)) {
						//esta nueva bandera se cumple
						iniciospeed(objeto,objeto.vh_nid,velflag,ram.vehiculos[objeto.vh_nid].velocidad[velflag].configuraciones,(objeto.vh_nid in posbuffer?JSON.parse(JSON.stringify(posbuffer[objeto.vh_nid])):false))
					}

				}
			}

			posbuffer[objeto.vh_nid] = objeto;
		}
	}catch(err){
		console.log('err dentro del modulo alertmod funcion work');
		console.log(err);
		//dumpError(err);
	}
}

let _alert = (objeto,extarg) =>{
	try{

		if (objeto.vh_nid in ram.vehsalert) {

			for(let conf in ram.vehsalert[objeto.vh_nid].perfil){

				let _actual = ram.vehsalert[objeto.vh_nid].perfil[conf];
				let indxtype = tiposdealertas[objeto.tipo];

				if (_actual.cfa_nid in ram.vehsmails) {
					if(ram.vehsmails[_actual.cfa_nid].perfil[indxtype].status){
						sentmail(objeto, ram.vehsmails[_actual.cfa_nid].user, ram.vehsmails[_actual.cfa_nid].perfil[indxtype].mails, _actual.cfa_nid, indxtype, extarg);
					}
				}

				if (_actual.cfa_nid in ram.visuales) {
					if(ram.visuales[_actual.cfa_nid].perfil[indxtype].status){
						sentvisualovocal('visual',objeto,ram.visuales[_actual.cfa_nid].user,_actual.cfa_nid,indxtype, extarg);
					}
				}

				if (_actual.cfa_nid in ram.vocales) {
					if(ram.vocales[_actual.cfa_nid].perfil[indxtype].status){
						sentvisualovocal('vocal',objeto,ram.vocales[_actual.cfa_nid].user,_actual.cfa_nid,indxtype, extarg);
					}
				}

			}

		}

	}catch(err){
		console.log('err dentro del modulo alertmod funcion work');
		console.log(err);
		dumpError(err);
	}
}

module.exports = {
	work 	: _work,
	alert 	: _alert,
	load 	: _load
};
