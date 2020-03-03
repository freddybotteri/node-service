"use strict";
//dependencias de node
const	nodemailer	= require('nodemailer'),
		forever		= require( 'forever' );


//FUNCION DE ENVIO DE CORREO
	let transporter;
	try{
		transporter = nodemailer.createTransport({
			host: '',
			port: 26,
			tls:{
				rejectUnauthorized: false,
			},
			auth: {
				
			}
		});
	}catch(ex){
		console.log("Error al crear tranportes de Correo");
		console.log(ex);
	}
	let sendMail = (para,htmlmail,subject) =>{
		let texmail  = htmlmail;
			try{
			let mailOptions = {
				from: 'Monitor Servicio GPS <>', // sender address
				to: para, // list of receivers
				subject: subject, // Subject line
				text: texmail, // plaintext body
				html: htmlmail // html body
			};

			transporter.sendMail(mailOptions, function(error, info){
				if(error){
						console.log(error);
				}else{
					console.log('Message sent: ' + info.response + '==>'+para);
				}
			});
		}catch(er){
				console.log("Error al enviar un correo");
				console.log(er);
		}
	};
//FIN FUNCION DE ENVIO DE CORREO

let cmd = ( process.env.DBG ? "node --debug" : "node" );
let	child = new( forever.Monitor )( 'entryPoint.js', {
		'silent': false,
		'watch': true,
		'command': cmd,
		"sourceDir": "//gpsmodules/",
		'watchIgnoreDotFiles': true,
		'watchIgnorePatterns': [ '/log/*',
		'/gpsmodules/node_modules/*',
		'*.json',
		'*.txt'],
		'logFile':'/gpsmodules/log/entryPoint.log',
		'errFile':'/gpsmodules/log/entryPoint.err'
		//'outFile':'./log/forever-entryPoint.out',
	});


console.log('Forever Inicio Servicio GPS');

//funciones de forever
child.on( "exit", function() {
	//sendMail('walter.aguilar@tivitrace.com','SERVICIO CAIDO entryPoint. INGRESE INMEDIATAMENTE A LEVANTAR EL SERVICIO MANUALMENTE','entryPoint');
	console.log( 'entryPoint.js is Down!' );
});

child.on( "restart", function() {
	console.log( 'entryPoint.js has restarted.' );
});

process.on( 'SIGINT', function() {
	//sendMail('walter.aguilar@tivitrace.com','SERVICIO FUE CERRADO MANUALMENTE entryPoint','entryPoint');
	console.log( "\nGracefully shutting down \'node forever\' from SIGINT (Ctrl-C)" );
	process.exit();
});

process.on( 'uncaughtException', function( err ) {
	//sendMail('walter.aguilar@tivitrace.com','Error: ' + err ,'entryPoint');
	console.log( 'Caught exception in \'node forever\': ' + err );
});


child.start();
forever.startServer( child );

