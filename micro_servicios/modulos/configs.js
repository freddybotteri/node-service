
module.exports = {
	nosqldb 	:	"mongodb://localhost/",
	nosqlhdl	:	"./nosql/mongodb",
	sqldb 		: {
		"user": "postgres",//tivieagleuser
		"password": "",//"",
		"host": "localhost",
		"database": "",
		"max": 5000,
		"min": 10,
		"idleTimeoutMillis": 5000 //close idle clients after 5 second
	},
	serverpath:'/home//',

	eagleobj	:	{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "Posicion",
		"postipo" 		: "",
		"title" 		: "",
		"latitud" 		: "0",
		"longitud" 		: "0",
		"velocidad" 	: "0",
		"altitud" 		: "0",
		"azimut" 		: "0",
		"accuracy" 		: "0",
		"odometro" 		: "0",
		"estadomotor" 	: "OFF",
		"estadoequipo" 	: "OFF",
		"GPStime" 		: "",
		"SendTime" 		: "",
		"bateria" 		: "",
		"horaserver" 	: new Date()
	},
	dinobj 	: {
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "Din",
		"title" 		: "",
		"nroent" 		: "",
		"valent" 		: "",
		"horaserver" 	: new Date()

	},
	geoobj:{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "Geo",
		"title" 		: "",
		"geoid" 		: "",
		"geotype" 		: "",
		"geoevent" 		: "",
		"GPStime" 		: "",
		"latlon" 		: "",
		"horaserver" 	: new Date()
	},
	stopobj:{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "stop",
		"title" 		: "",
		"geosin" 		: "",
		"timein" 		: "",
		"GPStimein" 	: "",
		"GPStimeout" 	: "",
		"latlon" 		: "",
		"horaserver" 	: new Date()
	},
	speedobj:{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "stop",
		"title" 		: "",
		"geosin" 		: "",
		"timein" 		: "",
		"GPStimein" 	: "",
		"GPStimeout"  	: "",
		"latlon" 		: "",
		"horaserver"  	: new Date()
	},
	devobj:{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "Dev",
		"title" 		: "",
		"temperatura" 	: "n/a",
		"simcard" 		: "n/a",
		"ibutton" 		: "n/a",
		"camera" 		: "n/a",
		"comData" 		: "n/a",
		"SendTime" 		: "",
		"horaserver" 	: new Date()
	},
	eventobj:{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "Event",
		"title" 		: "",
		"harshb" 		: "n/a",
		"callmon" 		: "n/a",
		"jamming" 		: "n/a",
		"SendTime" 		: "",
		"horaserver" 	: new Date()
	},
	syncobj:{
		"vh_nid"		: "",
		"imei" 			: "",
		"tipo" 			: "sync",
		"title" 		: "",
		"SendTime" 		: "",
		"horaserver" 	: new Date()
	}
};

