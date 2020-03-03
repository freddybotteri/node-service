'use strict';

const _socketIO		=	require('socket.io-client');


let communicator = {
	socketIO 		: 	0,
	stsconection	:	0,
	clientlist		:	{}
};
let copstart = true;
let callbacklist = [];

communicator.init = (callback)=>{

		if (communicator.socketIO.connected) {

			if(callback){
				callback();
			}

		}else{
			if(callback){
				callbacklist.push(callback);
			}
			if (copstart) {
				copstart = false;
				communicator.socketIO		=	_socketIO.connect('http://127.0.0.1');

				communicator.socketIO.on('connect', function(){

					console.log("Conectado socketIO...!!");
					communicator.socketIO.emit('GPSServRegister', {nombre: "AllGPS Modules Server", descrip: "soy el servidor MB de los GPS, para enfora, queclink y Android"});
					communicator.stsconection	= 1;

					communicator.on = (eventName, callback)=>{
						communicator.socketIO.on(eventName, callback);
					}
					communicator.emit = (eventName,object)=>{
						communicator.socketIO.emit(eventName,object);
					}
				});

				communicator.socketIO.on('disconnect', function(){
					console.log('Estoy desconectado del Front :(');
					communicator.stsconection	= 0;
				});
			}
			for (var i = 0; i < callbacklist.length; i++) {
				callbacklist[i]();
			}
			callbacklist.length = 0;
		}
}

module.exports =  communicator;
