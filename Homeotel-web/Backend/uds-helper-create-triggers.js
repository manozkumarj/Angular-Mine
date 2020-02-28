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
/******************* FOR WRITING TRIGGERS TO A FILE   ********************************/
/*************************************************************************************/
var fs = require('fs');


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

//global settings
dbSchema = 'digwal_server';
udsTargetTable = 'uds_upload_pending';
targetPath = 'D:\\office\\project digwal\\triggers\\local\\';
tableFilter = 'd%';
isServer = 0;

function executeQuery(strQuery, params, callback) {	
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
				callback(rows);                  
            }
			else {				
				console.log("query -> " + strQuery + "; error -> " + err);				
			}
        });        
    });		
}

createTriggersGetTablePKs();


function createTriggersGetTablePKs() {
	executeQuery(`select tab.table_name, sta.column_name, cols.data_type
					from information_schema.tables as tab
					inner join information_schema.statistics as sta
							on sta.table_schema = tab.table_schema
							and sta.table_name = tab.table_name
							and sta.index_name = 'primary'
					left join INFORMATION_SCHEMA.COLUMNS cols
							on cols.table_name = tab.table_name and cols.column_name = sta.column_name and cols.table_schema = tab.table_schema
					where tab.table_schema = '${dbSchema}'
						and tab.table_type = 'BASE TABLE'
						and tab.table_name like '${tableFilter}'
					order by sta.table_name, sta.SEQ_IN_INDEX;`, 
					null, createTriggersScript);
}

function createTriggersScript(rows) {
	var distinctTables = [];
	var tableNameWithWhereConditions = [];
	
	for(var i = 0; i < rows.length; i++) {
		var quote = "''";
		if(rows[i]['data_type'] == 'varchar') quote = "'\"'";			
		
		if(distinctTables.indexOf(rows[i]['table_name']) <= -1) {
			distinctTables.push(rows[i]['table_name']);				
			tableNameWithWhereConditions.push({
				table_name: rows[i]['table_name'],
				node_id_new_column_name: rows[i]['column_name'].indexOf('node_id') > -1 ? 'NEW.' + rows[i]['column_name'] : '',
				node_id_old_column_name: rows[i]['column_name'].indexOf('node_id') > -1 ? 'OLD.' + rows[i]['column_name'] : '',
				where_new_condition: "'" + rows[i]['column_name'] + " = ', " + quote + ", NEW." + rows[i]['column_name'] + ", " + quote,
				where_old_condition: "'" + rows[i]['column_name'] + " = ', " + quote + ", OLD." + rows[i]['column_name'] + ", " + quote
			});
		}
		else {
			for (var j = 0; j < tableNameWithWhereConditions.length; j++) {
				if (tableNameWithWhereConditions[j]['table_name'] == rows[i]['table_name']) {
					tableNameWithWhereConditions[j]['node_id_new_column_name'] = rows[i]['column_name'].indexOf('node_id') > -1 ? 'NEW.' + rows[i]['column_name'] : tableNameWithWhereConditions[j]['node_id_new_column_name'];		
					tableNameWithWhereConditions[j]['node_id_old_column_name'] = rows[i]['column_name'].indexOf('node_id') > -1 ? 'OLD.' + rows[i]['column_name'] : tableNameWithWhereConditions[j]['node_id_old_column_name'];							
					tableNameWithWhereConditions[j]['where_new_condition'] += ", ' AND " + rows[i]['column_name'] + " = ', " + quote + ", NEW." + rows[i]['column_name'] + ", " + quote;
					tableNameWithWhereConditions[j]['where_old_condition'] += ", ' AND " + rows[i]['column_name'] + " = ', " + quote + ", OLD." + rows[i]['column_name'] + ", " + quote;
				}			
			}	
		}
	}
	
	var allScriptsInOneFile = '';
	for(var i = 0; i < tableNameWithWhereConditions.length; i++) {		
			var localTriggersScriptTemplate = `DROP TRIGGER IF EXISTS ${tableNameWithWhereConditions[i]['table_name']}_insert; \r\n
DELIMITER $$ \r\n
CREATE TRIGGER ${tableNameWithWhereConditions[i]['table_name']}_insert \r\n
	AFTER INSERT ON ${tableNameWithWhereConditions[i]['table_name']} \r\n
	FOR EACH ROW \r\n
BEGIN \r\n
  IF(@from_uds IS NULL OR @from_uds != 1) THEN
	INSERT INTO ${udsTargetTable} \r\n
	  (table_name, operation, pk_condition, created_at) \r\n
	VALUES \r\n
	  ('${tableNameWithWhereConditions[i]['table_name']}', 'INSERT', CONCAT(${tableNameWithWhereConditions[i]['where_new_condition']}), NOW()); \r\n
  END IF;
END$$ \r\n
DELIMITER ; \r\n
 \r\n
 \r\n
DROP TRIGGER IF EXISTS ${tableNameWithWhereConditions[i]['table_name']}_update; \r\n
DELIMITER $$ \r\n
CREATE TRIGGER ${tableNameWithWhereConditions[i]['table_name']}_update \r\n
	AFTER UPDATE ON ${tableNameWithWhereConditions[i]['table_name']} \r\n
	FOR EACH ROW \r\n
BEGIN \r\n
  IF(@from_uds IS NULL OR @from_uds != 1) THEN
	INSERT INTO ${udsTargetTable} \r\n
	  (table_name, operation, pk_condition, created_at) \r\n
	VALUES \r\n
	  ('${tableNameWithWhereConditions[i]['table_name']}', 'UPDATE', CONCAT(${tableNameWithWhereConditions[i]['where_new_condition']}), NOW()); \r\n
  END IF;
END$$ \r\n
DELIMITER ; \r\n
 \r\n
 \r\n
DROP TRIGGER IF EXISTS ${tableNameWithWhereConditions[i]['table_name']}_delete; \r\n
DELIMITER $$ \r\n
CREATE TRIGGER ${tableNameWithWhereConditions[i]['table_name']}_delete \r\n
	BEFORE DELETE ON ${tableNameWithWhereConditions[i]['table_name']} \r\n
	FOR EACH ROW \r\n
BEGIN \r\n
  IF(@from_uds IS NULL OR @from_uds != 1) THEN
	INSERT INTO ${udsTargetTable} \r\n
	  (table_name, operation, pk_condition, created_at) \r\n
	VALUES \r\n
	  ('${tableNameWithWhereConditions[i]['table_name']}', 'DELETE', CONCAT(${tableNameWithWhereConditions[i]['where_old_condition']}), NOW()); \r\n
  END IF;
END$$ \r\n
DELIMITER ; \r\n  \r\n  \r\n  \r\n  \r\n`;
		

		var serverTriggersScriptTemplate = `DROP TRIGGER IF EXISTS ${tableNameWithWhereConditions[i]['table_name']}_insert; \r\n
DELIMITER $$ \r\n
CREATE TRIGGER ${tableNameWithWhereConditions[i]['table_name']}_insert \r\n
	AFTER INSERT ON ${tableNameWithWhereConditions[i]['table_name']} \r\n
	FOR EACH ROW \r\n
BEGIN \r\n
  IF(@from_uds IS NULL OR @from_uds != 1) THEN
	INSERT INTO ${udsTargetTable} \r\n
	  (target_node_id, table_name, operation, pk_condition, created_at) \r\n
	VALUES \r\n
	  (${tableNameWithWhereConditions[i]['node_id_new_column_name']}, '${tableNameWithWhereConditions[i]['table_name']}', 'INSERT', CONCAT(${tableNameWithWhereConditions[i]['where_new_condition']}), NOW()); \r\n
  END IF;
END$$ \r\n
DELIMITER ; \r\n
 \r\n
 \r\n
DROP TRIGGER IF EXISTS ${tableNameWithWhereConditions[i]['table_name']}_update; \r\n
DELIMITER $$ \r\n
CREATE TRIGGER ${tableNameWithWhereConditions[i]['table_name']}_update \r\n
	AFTER UPDATE ON ${tableNameWithWhereConditions[i]['table_name']} \r\n
	FOR EACH ROW \r\n
BEGIN \r\n
  IF(@from_uds IS NULL OR @from_uds != 1) THEN
	INSERT INTO ${udsTargetTable} \r\n
	  (target_node_id, table_name, operation, pk_condition, created_at) \r\n
	VALUES \r\n
	  (${tableNameWithWhereConditions[i]['node_id_new_column_name']}, '${tableNameWithWhereConditions[i]['table_name']}', 'UPDATE', CONCAT(${tableNameWithWhereConditions[i]['where_new_condition']}), NOW()); \r\n
  END IF;
END$$ \r\n
DELIMITER ; \r\n
 \r\n
 \r\n
DROP TRIGGER IF EXISTS ${tableNameWithWhereConditions[i]['table_name']}_delete; \r\n
DELIMITER $$ \r\n
CREATE TRIGGER ${tableNameWithWhereConditions[i]['table_name']}_delete \r\n
	BEFORE DELETE ON ${tableNameWithWhereConditions[i]['table_name']} \r\n
	FOR EACH ROW \r\n
BEGIN \r\n
  IF(@from_uds IS NULL OR @from_uds != 1) THEN
	INSERT INTO ${udsTargetTable} \r\n
	  (target_node_id, table_name, operation, pk_condition, created_at) \r\n
	VALUES \r\n
	  (${tableNameWithWhereConditions[i]['node_id_old_column_name']}, '${tableNameWithWhereConditions[i]['table_name']}', 'DELETE', CONCAT(${tableNameWithWhereConditions[i]['where_old_condition']}), NOW()); \r\n
  END IF;
END$$ \r\n
DELIMITER ; \r\n  \r\n  \r\n  \r\n  \r\n`;

		var scriptTemplate = isServer ? serverTriggersScriptTemplate : localTriggersScriptTemplate;
		allScriptsInOneFile += scriptTemplate;

		fs.writeFile(targetPath + tableNameWithWhereConditions[i]['table_name'] + '.txt', scriptTemplate, function (err) {
		  if (err) throw err;		  
		});		
	}

	fs.writeFile(targetPath + 'combined.txt', allScriptsInOneFile, function (err) {
	  if (err) throw err;		  
	});		
		
	
}



















