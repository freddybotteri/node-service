"use strict";
const	mongoose = require('mongoose');

module.exports = {
	raw :
		mongoose.Schema(
			{
				"imei": {type: String, required: true, trim: true},
				"data": {type: String, required: true, trim: true}
			},{
				timestamps: true
			}
		),
	track :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei"			: {type: String, required: true, trim: true},
				"tipo"			: {type: String, required: true, trim: true},
				"postipo"		: {type: String, trim: true},
				"title"			: {type: String, trim: true},
				"latitud"		: {type: String, trim: true},
				"longitud"		: {type: String, trim: true},
				"velocidad"		: {type: String, trim: true},
				"altitud"		: {type: String, trim: true},
				"azimut"		: {type: String, trim: true},
				"accuracy"		: {type: String, trim: true},
				"odometro"		: {type: String, trim: true},
				"estadomotor"	: {type: String, trim: true},
				"estadoequipo"	: {type: String, trim: true},
				"GPStime"		: {type: Date},
				"SendTime"		: {type: Date},
				"bateria"		: {type: String, trim: true},
				"horaserver"	: {type: String, required: true, trim: true}
			},{
			    timestamps: true
			}
		),
	din :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"nroent" 		: {type: String, trim: true},
				"valent" 		: {type: String, trim: true},
				"horaserver" 	: {type: String, required: true, trim: true}
			},{
			    timestamps: true
			}
		),
	geocerca :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"geoid" 		: {type: String, trim: true},
				"geotype" 		: {type: String, trim: true},
				"geoevent" 		: {type: String, trim: true},
				"GPStime" 		: {type: Date},
				"latlon" 		: {type: Array},
				"horaserver" 	: {type: String, required: true, trim: true}
			},{
				timestamps: true
			}
		),
	paro :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"geosin" 		: {type: Array},
				"timein" 		: {type: Number},
				"GPStimein" 	: {type: Date},
				"GPStimeout" 	: {type: Date},
				"latlon" 		: {type: String, trim: true},
				"horaserver" 	: {type: String, required: true, trim: true}
			},{
				timestamps: true
			}
		),
	speed :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"config" 		: {type: Array},
				"geosin" 		: {type: Array},
				"objspos" 		: {type: Array},
				"timein" 		: {type: Number},
				"GPStimein" 	: {type: Date},
				"GPStimeout"	: {type: Date},
				"latlon1" 		: {type: String, trim: true},
				"latlon2" 		: {type: String, trim: true},
				"horaserver"	: {type: String, required: true, trim: true}
			},{
				timestamps: true
			}
		),
	sync :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"SendTime" 		: {type: Date},
				"horaserver" 	: {type: String, required: true, trim: true}
			},{
			    timestamps: true
			}
		),
	device :
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"temperatura" 	: {type: String, trim: true},
				"simcard" 		: {type: String, trim: true},
				"ibutton" 		: {type: String, trim: true},
				"camera" 		: {type: String, trim: true},
				"comData" 		: {type: String, trim: true},
				"SendTime" 		: {type: Date},
				"horaserver" 	: {type: String, required: true, trim: true}
			},{
			    timestamps: true
			}
		),
	event:
		mongoose.Schema(
			{
				"vh_nid"		: {type: Number, required: true},
				"imei" 			: {type: String, required: true, trim: true},
				"tipo" 			: {type: String, trim: true},
				"title" 		: {type: String, trim: true},
				"harshb" 		: {type: String, trim: true},
				"callmon" 		: {type: String, trim: true},
				"jamming" 		: {type: String, trim: true},
				"SendTime" 		: {type: Date},
				"horaserver" 	: {type: String, required: true, trim: true}
			},{
			    timestamps: true
			}
		)
}
