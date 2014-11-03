var physicalConnPool = [];
var NO_OF_CONNECTIONS = 10;
var queue = [];
for (var i = 0; i < NO_OF_CONNECTIONS; i += 1) {
    physicalConnPool[i] = createConnection();
}
exports.createdbConnection = function() {
    return customConnection();
};

function createConnection() {
    var mysql = require('mysql');
    var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'mihir123',
		database : 'amazon'
    });
    connection.connect(function(error) {
        if (!error) {
            console.log("Connected!!!");
        } else {
            console.log("ISSUE:" + error);
        }
    });
    return connection;
}

function process() {
    console.log("Notification.");
    if (physicalConnPool.length != 0) {
        console.log("Oh, so there are free connections available in the pool");
        if (queue.length != 0) {
            console.log("There is also work to be done! Jobs In Queue: " + queue.length);
            var connection = getOneConnectionFromPool();
            var job = getOneJobFromQueue();
            connection.query(job.sql, function(err, res) {
                console.log("running the query.");
                job.fn(err, res);
                addConnectionToPool(connection);
                process();
            });
        }
    }
}

function addConnectionToPool(connection) {
    physicalConnPool.push(connection);
    console.log("Added connection back to pool");
};

function getOneJobFromQueue() {
    var job = queue.shift();
    console.log("Removing Job " + job.sql + " from Q");
    return job;
}

function getOneConnectionFromPool() {
    console.log("Removing Connection from Pool. Left in pool: " + physicalConnPool.length);
    return physicalConnPool.shift();
}

function enqueue(sql, fn) {
    console.log("Adding job to queue.");
    queue.push({
        "sql": sql,
        "fn": fn
    });
    process();
}

function customConnection() {
    return {
        "query": function(sql, fn) {
            enqueue(sql, function(err, res) {
                fn(err, res);
            });
        },
        "end": function() {
            //        	console.log("End fn called");
            //  this.realConnection.end()
        }
    };
};