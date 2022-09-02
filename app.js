
const http = require('http');
const url = require('url');
const {routes} =require('./routes');
const PORT = process.env.PORT || 3003
const { callGarbageCollector } = require('./global');
const { PARSING_EEROR_MESSAGE, SERVER_ERROR_CODE} = require('./errorConstants');
const { RESPONSE_HEADER}= require('./constants')
const FILE_PATH='example.txt'

// scope of improvement: memory leakage can be reduces, files can be opened and 
// closed at the start and end of applications. Buffer could have been used once in the 
// main memory. Was not possible due to time constrains



// exposed API,"/api/getLogsInTimeRange" with two query params-> timeStart and timeEnd (ISO String format, preferably).
// The idea is to use binary search in the logs time string to get the approximate start and end positions in the file 'example.tx'.
// Used streams to make sure the file does not needed to be loaded in main memory.
// Using transfrom streams to
// 	1. convert file text to new lines
//  2. filter logs (few logs will be extra after step 1 as approximate position has been found)
//  3. Convert each lines to string
//  4. writing in response writable stream
// Note: To get the data large by client without crashing, proper client needs to be set up to fetch response in chunks

const server = http.createServer(async (req, res) => {
	try{
		let parsedURL = url.parse(req.url, true);
		let path = parsedURL.pathname;
		const query=parsedURL.query;
		const method= req.method
		routes(path,method,query,{},req,res)
	}catch(er){
		console.log("parsing error", er.message)
		res.writeHead(SERVER_ERROR_CODE, RESPONSE_HEADER);
		res.end(JSON.stringify({ message: PARSING_EEROR_MESSAGE}));	
	}
	callGarbageCollector();
});
server.listen(PORT,()=>{
	console.log(`Server running at http://127.0.0.1:${PORT}`);
})

