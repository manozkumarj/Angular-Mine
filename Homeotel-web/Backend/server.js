/*****************************************************************/
/*****************************************************************/
/******************                          *********************/
/******************   PROJECT DIGWAL API     *********************/
/******************                          *********************/
/*****************************************************************/
/*****************************************************************/




/*************************************************************************************/
/****************** USING EXPRESS and CORS FOR MAKING THINGS SIMPLER **************************/
/*************************************************************************************/
/*eslint-disable no-unused-params */
var express = require('express');
var app = express();

var cors = require('cors');
app.use(cors());
app.options('*', cors()); // include before other routes


/*************************************************************************************/
/******************* CONVERTING RETURNED DATA TO JSON ********************************/
/*************************************************************************************/
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
//end of converting returned data to json




/*************************************************************************************/
/*************************** MYSQL HANDLING CODE *************************************/
/*************************************************************************************/

// Require process, so we can mock environment variables
const process = require('process');
const mysql = require('mysql');
const aes256 = require('aes256');
const config = require('./config');
const password = aes256.decrypt(typeof x, config.password);

var pool = mysql.createPool({
	connectionLimit: 100, //important
	host: config.host, //process.env.SQL_CONNECTION_NAME,
	user: config.user, //process.env.SQL_USER,
	password: password, //process.env.SQL_PASSWORD,
	database: config.database, //process.env.SQL_DATABASE,
	debug: false,
	dateStrings: 'date'
});

function executeQuery(strQuery, params, res, responseSenderCallback) {
	//TODO - Instead of console logging (and sometimes logging photos! To Console!!) Log to a file or db or something - based on the trade-offs involved
	//console.log("Query -> " + strQuery);
	//console.log("params -> " + params.join(','));	

	pool.getConnection(function (err, connection) {
		if (err) {
			console.log("error -> " + err);
			res.json({ "code": 100, "status": "Error in connection database", "error": err });
			return;
		}

		connection.query(strQuery, params, function (err, rows) {
			connection.release();
			if (!err) {
				//console.log("response -> " + JSON.stringify(rows));	
				responseSenderCallback(rows, res);
			}
			else {
				console.log("query -> " + strQuery + "; error -> " + err);
				res.json({ "error": "Something went wrong while running your request. Please contact admin." });
			}
		});
	});
}

function sendResponseNormal(rows, res) {
	res.json(rows);
}

function sendResponseTranslations(rows, res) {
	var translations = {};
	for (var i = 0; i < rows[0].length; i++) {
		translations[rows[0][i].name] = rows[0][i].translation;
	}
	res.json(translations);
}

function sendResponsePhoto(rows, res) {
	if (rows[0].length > 0 && rows[0][0]['photo']) {
		rows[0][0]['photo'] = Buffer.from(rows[0][0]['photo'], 'binary').toString('base64');
		res.json(rows);
	}
	else
		res.json({ "error": "Something went wrong while fetching the photo. Please contact admin." });
}

function sendResponseWithMultiplePhotos(rows, res) {
	if (rows[0].length > 0) {
		for (var i = 0; i < rows[0].length; i++) {
			if (rows[0][i]['photo'])
				rows[0][i]['photo'] = Buffer.from(rows[0][i]['photo'], 'binary').toString('base64');
		}
		res.json(rows);
	}
	else
		res.json({ "message": "Zero rows fetched." });
}

function sendResponseWithMultipleImageFiles(rows, res) {
	if (rows[0].length > 0) {
		for (var i = 0; i < rows[0].length; i++) {
			if (rows[0][i]['file_data'])
				rows[0][i]['file_data'] = Buffer.from(rows[0][i]['file_data'], 'binary').toString('base64');
		}
		res.json(rows);
	}
	else
		res.json({ "message": "Zero rows fetched." });
}
/**************************************************************************************/
/*********                     WEB APPLICATION API CALLS              *****************/
/**************************************************************************************/

//get node id (client's connected to this API will use this node id)
var responseStatus = "true";
app.get('/node_details', function (req, res) {
	var thisNodeId = config.this_node_id;
	var projectName = config.project_name;
	var deploymentType = config.deployment_type;
	if (thisNodeId)
		res.json({ "node_id": thisNodeId, "project_name": projectName, "deployment_type": deploymentType, "responseStatus": responseStatus });
	else
		res.json({ "error": "Something went wrong while fetching the node id. Please contact admin." });
});

//staff related
app.post('/staff/login', function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var thisNodeId = req.body.thisNodeId;
	var params = [username, password, thisNodeId];

	executeQuery("call sp_staff_login(?,?,?)", params, res, sendResponseNormal);
});

//get language translations
app.get('/translation/:lang', function (req, res) {
	var lang = req.params.lang;
	var params = [lang];

	executeQuery("call sp_master_translation_get(?)", params, res, sendResponseTranslations);
});

//home page data
app.get('/home/:thisNodeId', function (req, res) {
	var thisNodeId = req.params.thisNodeId;
	var params = [thisNodeId];

	executeQuery("call sp_home_counts(?)", params, res, sendResponseNormal);
});

//ben related
app.post('/ben/register', function (req, res) {

	var thisNodeId = req.body.thisNodeId;
	var photoBlob = req.body.photoBase64 ? Buffer.from(req.body.photoBase64, 'base64') : null;
	var firstName = req.body.firstName ? req.body.firstName : null;
	var lastName = req.body.lastName ? req.body.lastName : null;
	var dob = req.body.dob ? req.body.dob : null;
	var age = req.body.age;
	var ageUnitId = req.body.ageUnitId;
	var genderId = req.body.genderId;
	var fatherName = req.body.fatherName ? req.body.fatherName : null;
	var husbandName = req.body.husbandName ? req.body.husbandName : null;
	var maritalStatusId = req.body.maritalStatusId;
	var socialStatusId = req.body.socialStatusId;
	var economicStatusId = req.body.economicStatusId;
	var idProofTypeId = req.body.idProofTypeId;
	var idProofValue = req.body.idProofValue ? req.body.idProofValue : null;
	var literacyTypeId = req.body.literacyTypeId;
	var isPiramalStaff = req.body.isPiramalStaff;
	var phone = req.body.phone ? req.body.phone : null;
	var villageId = req.body.villageId;
	var mandalId = req.body.mandalId;
	var districtId = req.body.districtId;
	var otherLocation = req.body.otherLocation ? req.body.otherLocation : null;
	var benCategoryTypeId = req.body.benCategoryTypeId;
	var encTypeId = req.body.encTypeId;
	var createdBy = req.body.createdBy;

	//new fields	
	var occupationId = req.body.occupationId;
	var religionId = req.body.religionId;
	var nationalityId = req.body.nationalityId;
	var email = req.body.email;
	var addrFirstLine = req.body.addrFirstLine;
	var addrSecondLine = req.body.addrSecondLine;
	var city = req.body.city;
	var state = req.body.state;
	var country = req.body.country;
	var pincode = req.body.pincode;

	var params = [thisNodeId, photoBlob, firstName, lastName, dob, age, ageUnitId, genderId, fatherName, husbandName, maritalStatusId, socialStatusId, economicStatusId,
		idProofTypeId, idProofValue, literacyTypeId, isPiramalStaff, phone, villageId, mandalId, districtId, otherLocation, benCategoryTypeId, encTypeId, createdBy,
		occupationId, religionId, nationalityId, email, addrFirstLine, addrSecondLine, city, state, country, pincode];
	executeQuery("call sp_ben_register(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.post('/ben/revisit', function (req, res) {
	var photoBlob = req.body.photoBase64 ? Buffer.from(req.body.photoBase64, 'base64') : null;
	var benCategoryTypeId = req.body.benCategoryTypeId;
	var benId = req.body.benId;
	var benNodeId = req.body.benNodeId;
	var thisNodeId = req.body.thisNodeId;
	var encTypeId = req.body.encTypeId;
	var createdBy = req.body.createdBy;

	var params = [photoBlob, benCategoryTypeId, benId, benNodeId, thisNodeId, encTypeId, createdBy];

	executeQuery("call sp_ben_revisit(?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.post('/ben/update', function (req, res) {

	var benId = req.body.benId;
	var benNodeId = req.body.benNodeId;
	var photoBlob = req.body.photoBase64 ? Buffer.from(req.body.photoBase64, 'base64') : null;
	var firstName = req.body.firstName ? req.body.firstName : null;
	var lastName = req.body.lastName ? req.body.lastName : null;
	var dob = req.body.dob ? req.body.dob : null;
	var age = req.body.age;
	var ageUnitId = req.body.ageUnitId;
	var fatherName = req.body.fatherName ? req.body.fatherName : null;
	var husbandName = req.body.husbandName ? req.body.husbandName : null;
	var maritalStatusId = req.body.maritalStatusId;
	var socialStatusId = req.body.socialStatusId;
	var economicStatusId = req.body.economicStatusId;
	var idProofTypeId = req.body.idProofTypeId;
	var idProofValue = req.body.idProofValue ? req.body.idProofValue : null;
	var literacyTypeId = req.body.literacyTypeId;
	var isPiramalStaff = req.body.isPiramalStaff;
	var phone = req.body.phone ? req.body.phone : null;
	var villageId = req.body.villageId;
	var mandalId = req.body.mandalId;
	var districtId = req.body.districtId;
	var otherLocation = req.body.otherLocation ? req.body.otherLocation : null;
	var updatedBy = req.body.updatedBy;

	//new fields	
	var occupationId = req.body.occupationId;
	var religionId = req.body.religionId;
	var nationalityId = req.body.nationalityId;
	var email = req.body.email;

	var params = [benId, benNodeId, photoBlob, firstName, lastName, dob, age, ageUnitId, fatherName, husbandName, maritalStatusId, socialStatusId, economicStatusId, idProofTypeId, idProofValue, literacyTypeId, isPiramalStaff, phone, villageId, mandalId, districtId, otherLocation, updatedBy, occupationId, religionId, nationalityId, email];
	executeQuery("call sp_ben_update(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});


app.get('/ben/details/:benNodeId/:benId/:thisNodeId', function (req, res) {
	var benNodeId = req.params.benNodeId;
	var benId = req.params.benId;
	var thisNodeId = req.params.thisNodeId;

	var params = [benNodeId, benId, thisNodeId];
	executeQuery("call sp_ben_details_get(?,?,?)", params, res, sendResponseNormal);
});

app.get('/ben/encounters/:benNodeId/:benId', function (req, res) {
	var benNodeId = req.params.benNodeId;
	var benId = req.params.benId;

	var params = [benNodeId, benId];
	executeQuery("call sp_ben_encounters_get(?,?)", params, res, sendResponseNormal);
});

app.get('/ben/encounter/details/:encNodeId/:encId', function (req, res) {
	var encNodeId = req.params.encNodeId;
	var encId = req.params.encId;

	var params = [encNodeId, encId];
	executeQuery("call sp_ben_encounter_details_get(?,?)", params, res, sendResponseNormal);
});

app.get('/ben/photo/:benNodeId/:benId', function (req, res) {
	var benNodeId = req.params.benNodeId;
	var benId = req.params.benId;

	var params = [benNodeId, benId];
	executeQuery("call sp_ben_photo_get(?,?)", params, res, sendResponsePhoto);
});

app.get('/ben/search/:searchText/:searchType', function (req, res) {
	var searchText = req.params.searchText;
	var searchType = req.params.searchType;

	var params;
	if (searchType == 1 || searchType == 3) //name or phone based search - partial matches should also be fetched
		params = ["%" + searchText + "%", searchType];
	else if (searchType == 2 || searchType == 4)//id or aadhar based search - only exact matches to be fetched
		params = [searchText, searchType];

	executeQuery("call sp_ben_search(?,?)", params, res, sendResponseWithMultiplePhotos);
});

app.get('/ben/queue/:nodeId/:roleId/:splId', function (req, res) {
	var roleId = req.params.roleId;
	var nodeId = req.params.nodeId;
	var splId = req.params.splId;

	var params = [nodeId, roleId, splId];
	executeQuery("call sp_ben_queue(?,?,?)", params, res, sendResponseWithMultiplePhotos);
});

app.post('/ben/merge', function (req, res) {

	var firstBenId = req.body.firstBenId;
	var firstBenNodeId = req.body.firstBenNodeId;
	var secondBenId = req.body.secondBenId;
	var secondBenNodeId = req.body.secondBenNodeId;
	var updatedBy = req.body.updatedBy;

	var params = [firstBenId, firstBenNodeId, secondBenId, secondBenNodeId, updatedBy];
	executeQuery("call sp_ben_merge(?,?,?,?,?)", params, res, sendResponseNormal);
});



//complaints related
app.post('/enc/complaint/', function (req, res) {
	var commaSeparatedComplaintsToInsert = req.body.commaSeparatedComplaintsToInsert ? req.body.commaSeparatedComplaintsToInsert : null;
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;

	var params = [encId, encNodeId, commaSeparatedComplaintsToInsert];
	executeQuery("call sp_complaint_save(?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/complaint/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_complaint_get(?,?)", params, res, sendResponseNormal);
});




//complaint history related
app.post('/enc/complaint-history/', function (req, res) {
	var commaSeparatedComplaintsHistoryToInsert =
		req.body.commaSeparatedComplaintsHistoryToInsert ? req.body.commaSeparatedComplaintsHistoryToInsert : null;
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;

	var params = [encId, encNodeId, commaSeparatedComplaintsHistoryToInsert];
	executeQuery("call sp_complaint_history_save(?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/complaint-history/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_complaint_history_get(?,?)", params, res, sendResponseNormal);
});

//history -> habit related
app.post('/enc/history/habit/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var smokingId = req.body.smokingId;
	var smokingDuration = req.body.smokingDuration;
	var smokingFreq = req.body.smokingFreq;
	var alcoholId = req.body.alcoholId;
	var alcoholDuration = req.body.alcoholDuration;
	var alcoholFreq = req.body.alcoholFreq;
	var exerciseId = req.body.exerciseId;
	var exerciseDuration = req.body.exerciseDuration;
	var exerciseFreq = req.body.exerciseFreq;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, smokingId, smokingDuration, smokingFreq, alcoholId, alcoholDuration, alcoholFreq, exerciseId, exerciseDuration, exerciseFreq, createdBy];
	executeQuery("call sp_his_habit_save(?,?,?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/history/habit/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_his_habit_get(?,?)", params, res, sendResponseNormal);
});

//history -> personal history related
app.post('/enc/history/ph/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var commaSeparatedAllergiesToInsert = req.body.commaSeparatedAllergiesToInsert ? req.body.commaSeparatedAllergiesToInsert : null;
	var appetiteId = req.body.appetiteId;
	var bowelMovementId = req.body.bowelMovementId;
	var defecationId = req.body.defecationId;
	var handWashingId = req.body.handWashingId;
	var occupationId = req.body.occupationId;
	var drinkingWaterId = req.body.drinkingWaterId;
	var mosquitoExposureId = req.body.mosquitoExposureId;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, commaSeparatedAllergiesToInsert, appetiteId, bowelMovementId, defecationId, handWashingId, occupationId, drinkingWaterId, mosquitoExposureId, createdBy];
	executeQuery("call sp_his_ph_save(?,?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

//history -> personal history related
app.post('/enc/personal-history/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var fieldName = req.body.fieldName;
	var intFieldValue = req.body.intFieldValue;
	var textFieldValue = req.body.textFieldValue;
	var date = req.body.date;
	var createdBy = req.body.userId;

	var params = [encId, encNodeId, fieldName, intFieldValue, textFieldValue, date, createdBy];
	executeQuery("call sp_personal_history_save(?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/personal-history-get/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_personal_history_get(?,?)", params, res, sendResponseNormal);
});

app.get('/enc/history/ph/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_his_ph_get(?,?)", params, res, sendResponseNormal);
});



//history -> clinical history related
app.post('/enc/history/ch/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var commaSeparatedMedicalsToInsert = req.body.commaSeparatedMedicalsToInsert ? req.body.commaSeparatedMedicalsToInsert : null;
	var commaSeparatedSurgicalsToInsert = req.body.commaSeparatedSurgicalsToInsert ? req.body.commaSeparatedSurgicalsToInsert : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, commaSeparatedMedicalsToInsert, commaSeparatedSurgicalsToInsert, createdBy];
	executeQuery("call sp_his_ch_save(?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/history/ch/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_his_ch_get(?,?)", params, res, sendResponseNormal);
});


//history -> family history related
app.post('/enc/history/fh/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var commaSeparatedFamilyMedicalsToInsert = req.body.commaSeparatedFamilyMedicalsToInsert ? req.body.commaSeparatedFamilyMedicalsToInsert : null;

	var params = [encId, encNodeId, commaSeparatedFamilyMedicalsToInsert];
	executeQuery("call sp_his_fh_save(?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/history/fh/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_his_fh_get(?,?)", params, res, sendResponseNormal);
});


//history -> current medication related
app.post('/enc/history/current-medication/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var commaSeparatedCurrentMedicationToInsert = req.body.commaSeparatedCurrentMedicationToInsert ? req.body.commaSeparatedCurrentMedicationToInsert : null;

	var params = [encId, encNodeId, commaSeparatedCurrentMedicationToInsert];
	executeQuery("call sp_his_cur_medication_save(?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/history/current-medication/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_his_cur_medication_get(?,?)", params, res, sendResponseNormal);
});


//history -> obstetrics related
app.post('/enc/history/obstetrics/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var menstrualId = req.body.menstrualId;
	var periodId = req.body.periodId;
	var bleedingId = req.body.bleedingId;
	var painId = req.body.painId;
	var dischargeId = req.body.dischargeId;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, menstrualId, periodId, bleedingId, painId, dischargeId, createdBy];
	executeQuery("call sp_his_obs_save(?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/history/obstetrics/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_his_obs_get(?,?)", params, res, sendResponseNormal);
});


//immunization related
app.post('/enc/imm/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var benId = req.body.benId;
	var benNodeId = req.body.benNodeId;
	var deliveryTypeId = req.body.deliveryTypeId;
	var birthWeightId = req.body.birthWeightId;
	var createdBy = req.body.createdBy;
	var commaSeparatedPolioToInsert = req.body.commaSeparatedPolioToInsert ? req.body.commaSeparatedPolioToInsert : null;
	var commaSeparatedBcgToInsert = req.body.commaSeparatedBcgToInsert ? req.body.commaSeparatedBcgToInsert : null;
	var commaSeparatedDptToInsert = req.body.commaSeparatedDptToInsert ? req.body.commaSeparatedDptToInsert : null;
	var commaSeparatedMeaslesToInsert = req.body.commaSeparatedMeaslesToInsert ? req.body.commaSeparatedMeaslesToInsert : null;
	var commaSeparatedHepatitisBToInsert = req.body.commaSeparatedHepatitisBToInsert ? req.body.commaSeparatedHepatitisBToInsert : null;
	var commaSeparatedVitaminAToInsert = req.body.commaSeparatedVitaminAToInsert ? req.body.commaSeparatedVitaminAToInsert : null;

	var params = [encId, encNodeId, benId, benNodeId, deliveryTypeId, birthWeightId, createdBy, commaSeparatedPolioToInsert, commaSeparatedBcgToInsert, commaSeparatedDptToInsert, commaSeparatedMeaslesToInsert, commaSeparatedHepatitisBToInsert, commaSeparatedVitaminAToInsert];
	executeQuery("call sp_imm_save(?,?,?,?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/imm/:benNodeId/:benId', function (req, res) {
	var benId = req.params.benId;
	var benNodeId = req.params.benNodeId;

	var params = [benId, benNodeId];
	executeQuery("call sp_imm_get(?,?)", params, res, sendResponseNormal);
});


//clinical examination -> bmi related
app.post('/enc/ce/bmi/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var weight = req.body.weight;
	var height = req.body.height;
	var bmi = req.body.bmi;
	var waist = req.body.waist;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, height, weight, bmi, waist, createdBy];
	executeQuery("call sp_ce_bmi_save(?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/ce/bmi/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_ce_bmi_get(?,?)", params, res, sendResponseNormal);
});


//clinical examination -> vitals related
app.post('/enc/ce/vitals/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var temperature = req.body.temperature ? req.body.temperature : null;
	var pulseRate = req.body.pulseRate ? req.body.pulseRate : null;
	var respRate = req.body.respRate ? req.body.respRate : null;
	var bpSystolic = req.body.bpSystolic ? req.body.bpSystolic : null;
	var bpDiastolic = req.body.bpDiastolic ? req.body.bpDiastolic : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, temperature, pulseRate, respRate, bpSystolic, bpDiastolic, createdBy];
	executeQuery("call sp_ce_vitals_save(?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/ce/vitals/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_ce_vitals_get(?,?)", params, res, sendResponseNormal);
});


//clinical examination -> systemic examination related
app.post('/enc/ce/se/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var respSys = req.body.respSys ? req.body.respSys : null;
	var cardioSys = req.body.cardioSys ? req.body.cardioSys : null;
	var gastroSys = req.body.gastroSys ? req.body.gastroSys : null;
	var nervousSys = req.body.nervousSys ? req.body.nervousSys : null;
	var genitoSys = req.body.genitoSys ? req.body.genitoSys : null;
	var musculoSys = req.body.musculoSys ? req.body.musculoSys : null;
	var otherFindings = req.body.otherFindings ? req.body.otherFindings : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, respSys, cardioSys, gastroSys, nervousSys, genitoSys, musculoSys, otherFindings, createdBy];
	executeQuery("call sp_ce_se_save(?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/ce/se/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_ce_se_get(?,?)", params, res, sendResponseNormal);
});

//clinical examination -> general examination related
app.post('/enc/ce/ge/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var hasPallor = req.body.hasPallor;
	var hasJaundice = req.body.hasJaundice;
	var hasCyanosis = req.body.hasCyanosis;
	var hasClubbing = req.body.hasClubbing;
	var hasGingivitis = req.body.hasGingivitis;
	var hasLympha = req.body.hasLympha;
	var lymphaRemarks = req.body.lymphaRemarks ? req.body.lymphaRemarks : null;
	var hasEdema = req.body.hasEdema;
	var edemaRemarks = req.body.edemaRemarks ? req.body.edemaRemarks : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, hasPallor, hasJaundice, hasCyanosis, hasClubbing, hasGingivitis, hasLympha, lymphaRemarks, hasEdema, edemaRemarks, createdBy];
	executeQuery("call sp_ce_ge_save(?,?,?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/ce/ge/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_ce_ge_get(?,?)", params, res, sendResponseNormal);
});



//lab -> blood group related
app.post('/enc/lab/blood-group/', function (req, res) {
	var benId = req.body.benId;
	var benNodeId = req.body.benNodeId;
	var bloodGroupId = req.body.bloodGroupId;
	var createdBy = req.body.createdBy;

	var params = [benId, benNodeId, bloodGroupId, createdBy];
	executeQuery("call sp_lab_blood_group_save(?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/lab/blood-group/:benNodeId/:benId', function (req, res) {
	var benId = req.params.benId;
	var benNodeId = req.params.benNodeId;

	var params = [benId, benNodeId];
	executeQuery("call sp_lab_blood_group_get(?,?)", params, res, sendResponseNormal);
});

//lab -> lab test order related
app.post('/enc/lab/lab-tests-ordered/', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var commaSeparatedLabTestsOrderedToInsert = req.body.commaSeparatedLabTestsOrderedToInsert ? req.body.commaSeparatedLabTestsOrderedToInsert : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, commaSeparatedLabTestsOrderedToInsert, createdBy];
	executeQuery("call sp_lab_tests_ordered_save(?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/lab/lab-tests-ordered/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_lab_tests_ordered_get(?,?)", params, res, sendResponseNormal);
});

//lab ->  lab test results related
app.post('/enc/lab/lab-test-results/result', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var labInstituteId = req.body.labInstituteId;
	var labTestId = req.body.labTestId;
	var labTestParamId = req.body.labTestParamId;
	var result = req.body.result ? req.body.result : null;
	var unitId = req.body.unitId;
	var updatedBy = req.body.updatedBy;

	var params = [encId, encNodeId, labInstituteId, labTestId, labTestParamId, result, unitId, updatedBy];
	executeQuery("call sp_lab_test_result_save(?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

//save lab institution
app.post('/enc/lab/lab-test-results/institution', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var institutionId = req.body.institutionId;
	var otherLabInstitution = req.body.otherLabInstitution ? req.body.otherLabInstitution : null;
	var updatedBy = req.body.updatedBy;

	var params = [encId, encNodeId, institutionId, otherLabInstitution, updatedBy];
	executeQuery("call sp_lab_institution_save(?,?,?,?,?)", params, res, sendResponseNormal);
});

//we don't need to get separately as the lab test result get will contain this info within it..
app.get('/enc/lab/lab-test-results/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_lab_test_results_get(?,?)", params, res, sendResponseNormal);
});

//lab files related 
app.post('/enc/lab/lab-file', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var description = req.body.description ? req.body.description : null;
	var fileDataBlob = req.body.fileDataBase64 ? Buffer.from(req.body.fileDataBase64, 'base64') : null;
	var fileType = req.body.fileType ? req.body.fileType : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, description, fileDataBlob, fileType, createdBy];
	executeQuery("call sp_lab_file_save(?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/lab/lab-file/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_lab_files_get(?,?)", params, res, sendResponseWithMultipleImageFiles);
});

app.delete('/enc/lab/lab-file', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var description = req.body.description;

	var params = [encId, encNodeId, description];
	executeQuery("call sp_lab_file_delete(?,?,?)", params, res, sendResponseNormal);
});

//prescription files related 
app.post('/enc/presc/presc-file', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var fileDataBlob = req.body.fileDataBase64 ? Buffer.from(req.body.fileDataBase64, 'base64') : null;
	var fileType = req.body.fileType ? req.body.fileType : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, fileDataBlob, fileType, createdBy];
	executeQuery("call sp_presc_file_save(?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/presc/presc-file/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_presc_files_get(?,?)", params, res, sendResponseWithMultipleImageFiles);
});


app.delete('/enc/presc/presc-file', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;


	var params = [encId, encNodeId];
	executeQuery("call sp_presc_file_delete(?,?)", params, res, sendResponseNormal);
});



//prescription related
app.post('/enc/prescription', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var commaSeparatedDrugsToInsert = req.body.commaSeparatedDrugsToInsert ? req.body.commaSeparatedDrugsToInsert : null;
	var commaSeparatedDiagnosisToInsert = req.body.commaSeparatedDiagnosisToInsert ? req.body.commaSeparatedDiagnosisToInsert : null;
	var notes = req.body.notes ? req.body.notes : null;
	var advice = req.body.advice ? req.body.advice : null;
	var reviewDate = req.body.reviewDate ? req.body.reviewDate : null;
	var prescNodeId = req.body.prescNodeId;
	var doctorName = req.body.doctorName ? req.body.doctorName : null;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, commaSeparatedDiagnosisToInsert, commaSeparatedDrugsToInsert, notes, advice, reviewDate, prescNodeId, doctorName, createdBy];
	executeQuery("call sp_prescription_save(?,?,?,?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.post('/enc/prescription/tc', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var splId = req.body.splId;
	var createdBy = req.body.createdBy;

	var params = [encId, encNodeId, splId, createdBy];
	executeQuery("call sp_prescription_tc_save(?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/prescription/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_prescription_get(?,?)", params, res, sendResponseNormal);
});


//drug issue related
app.post('/enc/drug-issue', function (req, res) {
	var encId = req.body.encId;
	var encNodeId = req.body.encNodeId;
	var drugId = req.body.drugId;
	var issuedQty = req.body.issuedQty;
	var batchNo = req.body.batchNo;
	var issuedRemarks = req.body.issuedRemarks ? req.body.issuedRemarks : null;
	var updatedBy = req.body.updatedBy;

	var params = [encId, encNodeId, drugId, issuedQty, batchNo, issuedRemarks, updatedBy];
	executeQuery("call sp_drug_issue_save(?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/enc/drug-issue/:encNodeId/:encId', function (req, res) {
	var encId = req.params.encId;
	var encNodeId = req.params.encNodeId;

	var params = [encId, encNodeId];
	executeQuery("call sp_drug_issue_get(?,?)", params, res, sendResponseNormal);
});


//inventory related 
app.post('/inv/add', function (req, res) {
	var invNodeId = req.body.invNodeId;
	var invId = req.body.invId;
	var invTypeId = req.body.invTypeId;
	var batchNo = req.body.batchNo ? req.body.batchNo : null;
	var expiryDate = req.body.expiryDate ? req.body.expiryDate : null;
	var transactionQty = req.body.transactionQty;
	var createdBy = req.body.createdBy;

	var params = [invNodeId, invId, invTypeId, batchNo, expiryDate, transactionQty, createdBy];
	executeQuery("call sp_inv_add(?,?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.post('/inv/consume', function (req, res) {
	var invNodeId = req.body.invNodeId;
	var invId = req.body.invId;
	var invTypeId = req.body.invTypeId;
	var batchNo = req.body.batchNo ? req.body.batchNo : null;
	var transactionQty = req.body.transactionQty;
	var updatedBy = req.body.updatedBy;

	var params = [invNodeId, invId, invTypeId, batchNo, transactionQty, updatedBy];
	executeQuery("call sp_inv_consume(?,?,?,?,?,?)", params, res, sendResponseNormal);
});

app.post('/inv/open', function (req, res) {
	var invNodeId = req.body.invNodeId;
	var invId = req.body.invId;
	var invTypeId = req.body.invTypeId;
	var batchNo = req.body.batchNo ? req.body.batchNo : null;
	var openedBy = req.body.openedBy;

	var params = [invNodeId, invId, invTypeId, batchNo, openedBy];
	executeQuery("call sp_inv_open(?,?,?,?,?)", params, res, sendResponseNormal);
});

app.get('/inv/:invNodeId/:invTypeId', function (req, res) {
	var invNodeId = req.params.invNodeId;
	var invTypeId = req.params.invTypeId;

	var params = [invNodeId, invTypeId];
	executeQuery("call sp_inv_get(?,?)", params, res, sendResponseNormal);
});




//master data related
app.get('/master-data/registration-page', function (req, res) {
	var params = [];

	executeQuery("call sp_master_registration_get()", params, res, sendResponseNormal);
});

app.get('/master-data/mandal/:districtId', function (req, res) {
	var districtId = req.params.districtId;
	var params = [districtId];

	executeQuery("call sp_master_mandal_get(?)", params, res, sendResponseNormal);
});

app.get('/master-data/village/:mandalId', function (req, res) {
	var mandalId = req.params.mandalId;
	var params = [mandalId];

	executeQuery("call sp_master_village_get(?)", params, res, sendResponseNormal);
});

app.get('/master-data/complaints', function (req, res) {
	var params = [];

	executeQuery("call sp_master_complaint_get()", params, res, sendResponseNormal);
});

//history related masters 

app.get('/master-data/history', function (req, res) {
	var params = [];

	executeQuery("call sp_master_history_get()", params, res, sendResponseNormal);
});

app.get('/master-data/history/habits', function (req, res) {
	var params = [];

	executeQuery("call sp_master_history_habits_get()", params, res, sendResponseNormal);
});

app.get('/master-data/history/ph', function (req, res) {
	var params = [];

	executeQuery("call sp_master_history_ph_get()", params, res, sendResponseNormal);
});

app.get('/master-data/history/ch', function (req, res) {
	var params = [];

	executeQuery("call sp_master_history_ch_get()", params, res, sendResponseNormal);
});

app.get('/master-data/history/fh', function (req, res) {
	var params = [];

	executeQuery("call sp_master_history_fh_get()", params, res, sendResponseNormal);
});

app.get('/master-data/history/obstetrics', function (req, res) {
	var params = [];

	executeQuery("call sp_master_history_obstetrics_get()", params, res, sendResponseNormal);
});



//end of habits related

app.get('/master-data/immunization', function (req, res) {
	var params = [];

	executeQuery("call sp_master_immunization_get()", params, res, sendResponseNormal);
});

//lab related masters

app.get('/master-data/lab/lab-tests-ordered', function (req, res) {
	var params = [];

	executeQuery("call sp_master_lab_tests_ordered_get()", params, res, sendResponseNormal);
});

app.get('/master-data/lab/blood-group', function (req, res) {
	var params = [];

	executeQuery("call sp_master_lab_blood_group_get()", params, res, sendResponseNormal);
});

app.get('/master-data/lab/lab-test-results', function (req, res) {
	var params = [];

	executeQuery("call sp_master_lab_test_results_get()", params, res, sendResponseNormal);
});

app.get('/master-data/prescription', function (req, res) {
	var params = [];

	executeQuery("call sp_master_prescription_get()", params, res, sendResponseNormal);
});

app.get('/master-data/inventory', function (req, res) {
	var params = [];

	executeQuery("call sp_master_inventory_get()", params, res, sendResponseNormal);
});

app.listen(8081, () => {
	console.log(`Server is listening on port --> 8081`);
});
