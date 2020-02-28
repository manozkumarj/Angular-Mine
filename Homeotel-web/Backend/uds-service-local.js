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
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
//end of converting returned data to json


/*************************************************************************************/
/**************** FOR SENDING REQUESTS TO SERVER TO UPLOAD DATA***********************/
/*************************************************************************************/
var request = require('request');


/*************************************************************************************/
/*************************** MYSQL HANDLING CODE *************************************/
/*************************************************************************************/

// Require process, so we can mock environment variables
const process = require('process');
const mysql = require('mysql');
const aes256 = require('aes256');
const config = require('./config');
const password = aes256.decrypt(typeof x, config.password);
const thisNodeId = config.this_node_id;

var pool = mysql.createPool({
    connectionLimit: 100, //important
    host: config.host, //process.env.SQL_CONNECTION_NAME,
    user: config.user, //process.env.SQL_USER,
    password: password, //process.env.SQL_PASSWORD,
    database: config.database, //process.env.SQL_DATABASE,
    debug: false,
	dateStrings: 'date'
});

function executeQuery(strQuery, params, callback) {	
	//TODO - Instead of console logging (and sometimes logging photos! To Console!!) Log to a file or db or something - based on the trade-offs involved
	//console.log("Query -> " + strQuery);
	//console.log("params -> " + params.join(','));	
		                                                                 
	pool.getConnection(function (err, connection) {
        if (err) {			
			console.log("error -> " + err);            
            return;
        }        
		
		
		//first set the @from_uds on the connection, and then in the call back, execute the actual command
		connection.query('SET @from_uds = 1;', null, function (err, rows) {            
            if (!err) {        								
					connection.query(strQuery, params, function (err, rows) {
						connection.release();
						if (!err) {        								
							callback(rows);                  
						}
						else {				
							console.log("query -> " + strQuery + "; error -> " + err);				
						}
					});              
            }
			else {				
				console.log("query -> SET @from_uds = 1;" + " error -> " + err);				
			}
        });
		
		
           
    });		
}

async function executeQueryPromise(strQuery, params) {	
	//TODO - Instead of console logging (and sometimes logging photos! To Console!!) Log to a file or db or something - based on the trade-offs involved
	//console.log("Query -> " + strQuery);
	//console.log("params -> " + params.join(','));	
	return new Promise(function(resolve, reject) {
		pool.getConnection(function (err, connection) {
			if (err) {		
				console.log("error -> " + err);            
				reject(err);
			}        

			//first set the @from_uds on the connection, and then in the call back, execute the actual command
			connection.query('SET @from_uds = 1;', null, function (err, rows) {            
				if (!err) {        								
						connection.query(strQuery, params, function (err, rows) {
							connection.release();
							if (!err) {        								
								resolve(rows);                  
							}
							else {	
								reject(err);							
								console.log("query -> " + strQuery + "; error -> " + err);				
							}
						});              
				}
				else {				
					reject(err);
					console.log("query -> SET @from_uds = 1;" + " error -> " + err);				
				}
			});      
		});		
	});
}

/****** utility functions *******/
async function checkInternet(cb, res) {	
	return new Promise(function (resolve, reject) {
		require('dns').lookup('google.com',function(err) {
			if (err && err.code == "ENOTFOUND") {
				reject();
			} else {
				resolve();
			}
		});
	});
}

/***** Upload Related *******************/

uploadInProgress = false;

doUpload(); 

function doUpload() {	
	fetchPendingUploadRows();
	
	//and repeat every 10 seconds
	setInterval(function() {		
	  if(!uploadInProgress)
		  fetchPendingUploadRows();		
	}, 10000);		
}

async function fetchPendingUploadRows(hasInternet) {
	uploadInProgress = true;
	await checkInternet()
	.then(() => {								
			var strUploadMetaQuery = `SELECT @i:=@i+1 as row_number, uds.*, (SELECT (COUNT(*) - @i) FROM uds_upload_pending) as pending_upload_count
										FROM uds_upload_pending uds,
										(SELECT @i:=0) AS temp
										ORDER BY revision_id 
										LIMIT 100;`;
			executeQuery(strUploadMetaQuery, null, getTableDataAsync);		
	})
	.catch(() => {
		console.log('something went wrong with check internet');
		uploadInProgress = false;
	});
}

async function getTableDataAsync(rows) {	
	var data = [];	
			
	for (const row of rows) {
		if(row['operation'].toLowerCase() == 'insert' || row['operation'].toLowerCase() == 'update') {
			var query = "SELECT * FROM " + row['table_name'] + " WHERE " + row['pk_condition'];
			const contents = await executeQueryPromise(query, null);
			if(contents.length == 0) {
				deleteUploadRevisionWithNoData(row['revision_id']); //for now if data is missing, we'll assume it was deleted by a later delete option
			}
			else {				
				contents[0]['meta_revision_id'] = row['revision_id'];								
				contents[0]['meta_source_node_id'] = thisNodeId;
				contents[0]['meta_table_name'] = row['table_name'];
				contents[0]['meta_operation'] = row['operation'];	
				contents[0]['meta_pk_condition'] = row['pk_condition'];						
				contents[0]['meta_pending_upload_count'] = row['pending_upload_count'];							
				contents[0]['meta_created_at'] = row['created_at'];		
				
				data.push(contents[0]);
			}
		}
		else if(row['operation'].toLowerCase() == 'delete') {
			var deleteRowMetaData = {};
			deleteRowMetaData['meta_revision_id'] = row['revision_id'];					
			deleteRowMetaData['meta_source_node_id'] = thisNodeId;
			deleteRowMetaData['meta_table_name'] = row['table_name'];
			deleteRowMetaData['meta_operation'] = row['operation'];	
			deleteRowMetaData['meta_pk_condition'] = row['pk_condition'];					
			deleteRowMetaData['meta_pending_upload_count'] = row['pending_upload_count'];					
			deleteRowMetaData['meta_created_at'] = row['created_at'];
			
			data.push(deleteRowMetaData);
		}				
	}
	
	uploadData(data);
}

function uploadData(uploadData) {	
	var data = { sourceNodeId: thisNodeId, data: uploadData }	
	//note - json below is a keyword @ request library indicating that the data is in json format..	
	request.post(
    config.uds_server_url + 'upload', { json: data },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {			
            if(body['uploaded_revisions'] && body['uploaded_revisions'].length > 0) {
				var uploadedRevisions = body['uploaded_revisions'].join(',');				
				deleteUploadedRevisions(uploadedRevisions);
			}
			else uploadInProgress = false;
        }
		else uploadInProgress = false;
    });
}

function deleteUploadRevisionWithNoData(uploadRevision) {	
	executeQueryPromise("DELETE FROM uds_upload_pending WHERE revision_id IN (" + uploadRevision + ");", null)
	.then(() => {	
		console.log('deleting upload revision (coz no data found) - ' + uploadRevision);										
	})
	.catch(error => {
		console.log('err' + error);		
	});
}

function deleteUploadedRevisions(uploadedRevisions) {	
	executeQueryPromise("DELETE FROM uds_upload_pending WHERE revision_id IN (" + uploadedRevisions + ");", null)
	.then(() => {			
		console.log("completed uploading upload revision ids - " + uploadedRevisions);
		uploadInProgress = false;					
	})
	.catch(error => {
		console.log('err' + error);
		uploadInProgress = false;
	});
}



/************* Download Related ***********************/

downloadInProgress = false;

doDownload();

function doDownload() {	
	fetchDownloadData();
	
	//and repeat every 10 seconds
	setInterval(function() {
	  if(!downloadInProgress)
		  fetchDownloadData();		
	}, 10000);		
}

async function fetchDownloadData() {	
	downloadInProgress = true;
	await checkInternet()	
	.catch(() => { 
		console.log('something went wrong with check internet'); 
		downloadInProgress = false;
		return; 
	});				
	
	//first get the max downloaded id
	var recentlyDownloadedIds = 0;
	await executeQueryPromise('SELECT GROUP_CONCAT(revision_id) as downloaded_revisions FROM uds_download_completed WHERE is_server_updated = 0;', null)
		.then((rows) => { 			
			recentlyDownloadedIds = rows[0]['downloaded_revisions']
		})
		.catch((error) => { console.log(error); });	
				
	var data = { targetNodeId: thisNodeId, recentlyDownloadedIds : recentlyDownloadedIds }
	//then, get the download data for this node not in recentlyDownloadedIds
	//note - json below is a keyword @ request library indicating that the data is in json format..
	request.post(
	config.uds_server_url + 'download/', { json: data },
	function (error, response, body) {						
		if (!error && response.statusCode == 200) {	
			//console.log(body);
			//var jsonBody = JSON.parse(body)		
			if(body['data']) {							
				var downloadData = body['data'];
				fetchAndInsertRows(downloadData, recentlyDownloadedIds);
			}			
			else downloadInProgress = false;
		}
		else downloadInProgress = false;								
	});
}

async function fetchAndInsertRows(downloadData, recentlyDownloadedIds) {
	//first update the server updated status for previously downloaded revisions
	await updateServerUpdatedStatus(recentlyDownloadedIds)		
	.catch(error => {
		console.log(error['sqlMessage']);			
	  });					
	
	//then proceed to download the actual data
	var downloadedRevisions = [];
	for(var i = 0; i < downloadData.length; i++) { 		
		await generateAndExecuteQuery(downloadData[i])
		.then(() => {
			downloadedRevisions.push(downloadData[i]['meta_revision_id'])
		})
		.catch(error => {
			console.log(error['sqlMessage']);
			process.exit(1);
		  });						  
	}			
	
	if(downloadedRevisions && downloadedRevisions.length > 0)
		console.log('download completed for ' + downloadedRevisions.join(',') + ' ids');		
	
	//after all download is completed, reset download in progress flag
	downloadInProgress = false;
}

async function updateServerUpdatedStatus(recentlyDownloadedIds) {
	return new Promise(function(resolve, reject) {
		if(!recentlyDownloadedIds) resolve();
		
		var queryParams = [];			
		var strQuery = "UPDATE uds_download_completed SET is_server_updated = 1 WHERE revision_id IN(" + recentlyDownloadedIds + ");";				
										
		executeQueryPromise(strQuery, null)
		.then(data => resolve(data))
		.catch(error => reject(error));			
		
	});
}

async function generateAndExecuteQuery(downloadDataRow) {					
	if(downloadDataRow['meta_operation'].toLowerCase() == 'insert') { 										
		await generateAndExecuteInsertQuery(downloadDataRow)		
		.catch((error) => { throw error; });			
	}
	else if(downloadDataRow['meta_operation'].toLowerCase() == 'update') { 										
		await generateAndExecuteUpdateQuery(downloadDataRow)
		.catch((error) => { throw error; });
	}
	else if(downloadDataRow['meta_operation'].toLowerCase() == 'delete') { 										
		await generateAndExecuteDeleteQuery(downloadDataRow)
		.catch((error) => { throw error; });	
	}
	
	//update the meta query in uds_completed table @ server
	await generateAndExecuteMetaQuery(downloadDataRow)		
	.catch((error) => { throw error; });			
}

async function generateAndExecuteMetaQuery(downloadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "INSERT INTO uds_download_completed (revision_id, table_name, operation, pk_condition, pending_download_count, created_at, downloaded_at, is_server_updated) VALUES (?,?,?,?,?,?,NOW(), 0);";				
				
		queryParams.push(downloadDataRow['meta_revision_id']);		
		queryParams.push(downloadDataRow['meta_table_name']);
		queryParams.push(downloadDataRow['meta_operation']);
		queryParams.push(downloadDataRow['meta_pk_condition']);
		queryParams.push(downloadDataRow['meta_pending_download_count']);
		queryParams.push(downloadDataRow['meta_created_at']);
					
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
		
	});
}

async function generateAndExecuteInsertQuery(downloadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "INSERT IGNORE INTO " + downloadDataRow['meta_table_name'] + " ( \n";
		
		for (var k in downloadDataRow) {
			if (downloadDataRow.hasOwnProperty(k) && k.indexOf('meta') <= -1) {					
					strQuery += k + ",";
			}
		}		
		
		strQuery = strQuery.replace(/,\s*$/, ""); //removing the last comma						
		strQuery += ") VALUES \n"; //closing the parameters block			
							
		strQuery += "("; //starting the values block	
		for (var k in downloadDataRow) {
			if (downloadDataRow.hasOwnProperty(k) && k.indexOf('meta') <= -1) {					
				strQuery += "?,";
				if(typeof downloadDataRow[k] == 'object' && downloadDataRow[k] && downloadDataRow[k].hasOwnProperty('data'))
					queryParams.push(Buffer.from(downloadDataRow[k]['data']));
				else 
					queryParams.push(downloadDataRow[k]);
			}			
		}			
					
		strQuery = strQuery.replace(/,\s*$/, ""); //removing the last comma						
		strQuery += ");"; //closing the values block
	
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
		
	});
}


async function generateAndExecuteUpdateQuery(downloadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "UPDATE " + downloadDataRow['meta_table_name'] + " SET \n";
		
		for (var k in downloadDataRow) {
			if (downloadDataRow.hasOwnProperty(k) && k.indexOf('meta') <= -1) {					
				strQuery += k + " = ?,";
				if(typeof downloadDataRow[k] == 'object' && downloadDataRow[k] && downloadDataRow[k].hasOwnProperty('data'))
					queryParams.push(Buffer.from(downloadDataRow[k]['data']));					
				else 
					queryParams.push(downloadDataRow[k]);
			}
		}			
		
		strQuery = strQuery.replace(/,\s*$/, ""); //removing the last comma						
		strQuery += "\n WHERE "+ downloadDataRow['meta_pk_condition'] + ";"; //closing the parameters block	

		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
	});
}


async function generateAndExecuteDeleteQuery(downloadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "DELETE FROM " + downloadDataRow['meta_table_name'] + " \n";				
		strQuery += " WHERE "+ downloadDataRow['meta_pk_condition'] + ";"; //closing the parameters block										
											
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error =>  reject(error));
	});
}








