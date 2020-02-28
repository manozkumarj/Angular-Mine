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

/* old ones before making 100% sure the @from_uds is set everytime before executing the query 
function executeQuery(strQuery, params, callback, res) {	
	//TODO - Instead of console logging (and sometimes logging photos! To Console!!) Log to a file or db or something - based on the trade-offs involved
	//console.log("Query -> " + strQuery);
	//console.log("params -> " + params.join(','));	
		                                                                 
	pool.getConnection(function (err, connection) {
        if (err) {			
			console.log("error -> " + err);    
            return;
        }        

        connection.query(strQuery, params, function (err, rows) {
            connection.release();
            if (!err) {        								
				callback(rows, res);                  
            }
			else {				
			//"query -> " + strQuery + 
				console.log("; error -> " + err);			
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

			connection.query(strQuery, params, function (err, rows) {
				connection.release();
				if (!err) {     							
					resolve(rows);                  
				}
				else {	
					console.log("error -> " + err);				
					reject(err);
					//console.log("query -> " + strQuery + "; error -> " + err);				
				}
			});        
		});		
	});
}
*/

function executeQuery(strQuery, params, callback, res) {	
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
							callback(rows, res);                  
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

/***** Allowed API calls *******************/

app.post('/upload', function (req, res) {    	
    var uploadData = req.body.data;   
	var sourceNodeId = req.body.sourceNodeId;
    fetchAndInsertRows(uploadData, sourceNodeId, res);
});

app.post('/download', function (req, res) {    	
    var recentlyDownloadedIds = req.body.recentlyDownloadedIds;   
	var targetNodeId = req.body.targetNodeId;
    getDownloadData(targetNodeId, recentlyDownloadedIds, res);
});

/***** Upload related functionality ****/

async function fetchAndInsertRows(uploadData, sourceNodeId, res) {
	var uploadedRevisions = [];
	if(uploadData.length == 0) {
		await generateAndExecuteNoDataPing(sourceNodeId)
		.catch((err) => console.log(err));
	}
	else {		
		for(var i = 0; i < uploadData.length; i++) { 		
			await generateAndExecuteQuery(uploadData[i])
			.then(() => {
				uploadedRevisions.push(uploadData[i]['meta_revision_id'])
			})
			.catch(error => {
				console.log(error['sqlMessage']);
				process.exit(1);
			  });						  
		}						
	}
	res.json({ "uploaded_revisions": uploadedRevisions });
}

async function generateAndExecuteQuery(uploadDataRow) {					
	if(uploadDataRow['meta_operation'].toLowerCase() == 'insert') { 										
		await generateAndExecuteInsertQuery(uploadDataRow)		
		.catch((error) => { throw error; });			
	}
	else if(uploadDataRow['meta_operation'].toLowerCase() == 'update') { 										
		await generateAndExecuteUpdateQuery(uploadDataRow)
		.catch((error) => { throw error; });
	}
	else if(uploadDataRow['meta_operation'].toLowerCase() == 'delete') { 										
		await generateAndExecuteDeleteQuery(uploadDataRow)
		.catch((error) => { throw error; });	
	}
	
	//update the meta query in uds_completed table @ server
	await generateAndExecuteMetaQuery(uploadDataRow)		
	.catch((error) => { throw error; });
		
	//if d_ben or db_photo, then update download pending table so that the other center can download this info
	if(uploadDataRow['meta_table_name'].toLowerCase() == 'd_ben' || uploadDataRow['meta_table_name'].toLowerCase() == 'db_photo') {
		await generateAndExecuteBenDownloadQuery(uploadDataRow)		
		.catch((error) => { throw error; });
	}
}

async function generateAndExecuteNoDataPing(sourceNodeId) {	
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "INSERT INTO uds_logger (node_id, event_description, created_at) VALUES (?,?, NOW());";												
		queryParams.push(sourceNodeId);
		queryParams.push('No data to upload ping');		
					
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));					
	});
}

async function generateAndExecuteBenDownloadQuery(uploadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "INSERT INTO uds_download_pending (target_node_id, table_name, operation, pk_condition, created_at) VALUES (?,?,?,?,?);";				
						
		var targetNodeId = uploadDataRow['meta_source_node_id'] == '1' ? '2' : '1'
		queryParams.push(targetNodeId);
		queryParams.push(uploadDataRow['meta_table_name']);
		queryParams.push(uploadDataRow['meta_operation']);
		queryParams.push(uploadDataRow['meta_pk_condition']);		
		queryParams.push(uploadDataRow['meta_created_at']);
					
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
		
	});
}

async function generateAndExecuteMetaQuery(uploadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "INSERT INTO uds_upload_completed (revision_id, source_node_id, table_name, operation, pk_condition, pending_upload_count, created_at, uploaded_at) VALUES (?,?,?,?,?,?,?,NOW());";				
				
		queryParams.push(uploadDataRow['meta_revision_id']);
		queryParams.push(uploadDataRow['meta_source_node_id']);
		queryParams.push(uploadDataRow['meta_table_name']);
		queryParams.push(uploadDataRow['meta_operation']);
		queryParams.push(uploadDataRow['meta_pk_condition']);
		queryParams.push(uploadDataRow['meta_pending_upload_count']);
		queryParams.push(uploadDataRow['meta_created_at']);
					
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
		
	});
}

async function generateAndExecuteInsertQuery(uploadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "INSERT IGNORE INTO " + uploadDataRow['meta_table_name'] + " ( \n";
		
		for (var k in uploadDataRow) {
			if (uploadDataRow.hasOwnProperty(k) && k.indexOf('meta') <= -1) {					
					strQuery += k + ",";
			}
		}		
		
		strQuery = strQuery.replace(/,\s*$/, ""); //removing the last comma						
		strQuery += ") VALUES \n"; //closing the parameters block			
							
		strQuery += "("; //starting the values block	
		for (var k in uploadDataRow) {
			if (uploadDataRow.hasOwnProperty(k) && k.indexOf('meta') <= -1) {					
				strQuery += "?,";
				if(typeof uploadDataRow[k] == 'object' && uploadDataRow[k] && uploadDataRow[k].hasOwnProperty('data'))
					queryParams.push(Buffer.from(uploadDataRow[k]['data']));
				else 
					queryParams.push(uploadDataRow[k]);
			}			
		}			
					
		strQuery = strQuery.replace(/,\s*$/, ""); //removing the last comma						
		strQuery += ");"; //closing the values block
	
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
		
	});
}


async function generateAndExecuteUpdateQuery(uploadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "UPDATE " + uploadDataRow['meta_table_name'] + " SET \n";
		
		for (var k in uploadDataRow) {
			if (uploadDataRow.hasOwnProperty(k) && k.indexOf('meta') <= -1) {					
				strQuery += k + " = ?,";
				if(typeof uploadDataRow[k] == 'object' && uploadDataRow[k] && uploadDataRow[k].hasOwnProperty('data'))
					queryParams.push(Buffer.from(uploadDataRow[k]['data']));					
				else 
					queryParams.push(uploadDataRow[k]);
			}
		}			
		
		strQuery = strQuery.replace(/,\s*$/, ""); //removing the last comma						
		strQuery += "\n WHERE "+ uploadDataRow['meta_pk_condition'] + ";"; //closing the parameters block	

		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error => reject(error));			
	});
}


async function generateAndExecuteDeleteQuery(uploadDataRow) {
	return new Promise(function(resolve, reject) {
		var queryParams = [];			
		var strQuery = "DELETE FROM " + uploadDataRow['meta_table_name'] + " \n";				
		strQuery += " WHERE "+ uploadDataRow['meta_pk_condition'] + ";"; //closing the parameters block										
											
		executeQueryPromise(strQuery, queryParams)
		.then(data => resolve(data))
		.catch(error =>  reject(error));
	});
}




/********** download related functionality ******************/

async function getDownloadData(targetNodeId, recentlyDownloadedIds, res) {	

	//first let's delete all the download revisions already completed
	//and no need to wait for this to complete, it can continue asynchronously, no problem..
	deleteDownloadededRevisions(targetNodeId, recentlyDownloadedIds);
	
	var strQueryRevisionIdNotInPart = recentlyDownloadedIds ? " AND revision_id NOT IN (" + recentlyDownloadedIds + ")" : "";	
	
	var strDownloadMetaQuery = `SELECT @i:=@i+1 as row_number, uds.*,
								   (SELECT (COUNT(*) - @i) FROM uds_download_pending WHERE target_node_id = ${targetNodeId} ${strQueryRevisionIdNotInPart}) as pending_download_count
										FROM uds_download_pending uds,
									(SELECT @i:=0) AS temp
									WHERE target_node_id = ${targetNodeId} ${strQueryRevisionIdNotInPart}
									ORDER BY revision_id
									LIMIT 100;`;
									
	executeQuery(strDownloadMetaQuery, null, getTableDataAsync, res);				
}

async function getTableDataAsync(rows, res) {	
	var data = [];	
			
	for (const row of rows) {
		if(row['operation'].toLowerCase() == 'insert' || row['operation'].toLowerCase() == 'update') {
			var query = "SELECT * FROM " + row['table_name'] + " WHERE " + row['pk_condition'];
			const contents = await executeQueryPromise(query, null);
			if(contents.length == 0) {
				deleteDownloadRevisionWithNoData(row['revision_id']); //for now if data is missing, we'll assume it was deleted by a later delete option
			}
			else {				
				contents[0]['meta_revision_id'] = row['revision_id'];	
				contents[0]['meta_source_node_id'] = 1;			
				contents[0]['meta_table_name'] = row['table_name'];
				contents[0]['meta_operation'] = row['operation'];	
				contents[0]['meta_pk_condition'] = row['pk_condition'];						
				contents[0]['meta_pending_download_count'] = row['pending_download_count'];							
				contents[0]['meta_created_at'] = row['created_at'];		
				
				data.push(contents[0]);
			}
		}
		else if(row['operation'].toLowerCase() == 'delete') {
			var deleteRowMetaData = {};
			deleteRowMetaData['meta_revision_id'] = row['revision_id'];	
			deleteRowMetaData['meta_source_node_id'] = 1;				
			deleteRowMetaData['meta_table_name'] = row['table_name'];
			deleteRowMetaData['meta_operation'] = row['operation'];	
			deleteRowMetaData['meta_pk_condition'] = row['pk_condition'];					
			deleteRowMetaData['meta_pending_download_count'] = row['pending_download_count'];					
			deleteRowMetaData['meta_created_at'] = row['created_at'];
			
			data.push(deleteRowMetaData);
		}				
	}

	res.json({ 'data' : data });
}

function deleteDownloadRevisionWithNoData(downloadRevision) {	
	executeQueryPromise("DELETE FROM uds_download_pending WHERE revision_id IN (" + downloadRevision + ");", null)
	.then(() => {	
		console.log('deleting download revision with no data for revision id - ' + downloadRevision);				
	})
	.catch(error => {
		console.log('err' + error);		
	});
}

function deleteDownloadededRevisions(targetNodeId, recentlyDownloadedIds) {	
	executeQueryPromise("DELETE FROM uds_download_pending WHERE target_node_id = " + targetNodeId + " AND revision_id IN (" + recentlyDownloadedIds + ");", null)
	.then(() => {	
		if(recentlyDownloadedIds) 
			console.log('deleting already downloaded revisions - (' + recentlyDownloadedIds + "); for target node - " + targetNodeId);						
	})
	.catch(error => {
		console.log('err' + error);		
	});
}

app.listen(9090);


