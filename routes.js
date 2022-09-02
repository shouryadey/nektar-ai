const {FILE_PATH, RESPONSE_HEADER}= require('./constants')
const {filterOutLogsBasedOnDateRange,transformArraysToString,transformStringToNewLine} =require('./transformers');
const {getLowerBoundTimeFromInputTime} =require('./fileUtils');
const fs = require('fs');
const { ROUTE_NOT_FOUND_ERROR_MESSAGE ,NOT_FOUND_EROR_CODE ,PROCESSING_ERROR_MESSAGE, SERVER_ERROR_CODE} = require('./errorConstants');
const { callGarbageCollector } = require('./global');


const logError=(err)=>{
	console.log(err);
}
const logEnd=(endMessage='end')=>{
	console.log('end')
}
const routes=(path,method,query,body,req,res, )=>{
	if(method==="GET" && path== "/api/getLogsInTimeRange"){
		try{
			
			let {timeStart, timeEnd}= query;
			
			timeStart= (new Date(timeStart).toISOString());
			timeEnd= (new Date(timeEnd).toISOString()); 

			let [,startingBytes]=getLowerBoundTimeFromInputTime(timeStart, FILE_PATH)
			let [,endingBytes]= getLowerBoundTimeFromInputTime(timeEnd,FILE_PATH) 
			
			
			let readableStream = fs.createReadStream(FILE_PATH,{encoding:'utf-8', start:startingBytes, end:endingBytes+256, highWaterMark:300});
			readableStream.on('end',logEnd)
			.pipe(transformStringToNewLine()).on('error',logError)
			.pipe(filterOutLogsBasedOnDateRange(timeStart, timeEnd)).on('error',logError)
			.pipe(transformArraysToString()).on('error',logError)			
			.pipe(res).on('error',logError)

			res.on('finish',()=>{
				// console.log('Destroying readable stream')
				readableStream.destroy();
			})


			// console.log(process.memoryUsage().rss/1024/1024,process.memoryUsage().heapTotal/1024/1024,process.memoryUsage().heapUsed/1024/1024,process.memoryUsage().external/1024/1024 )
		}catch(ex){
			console.log(ex.message)
			res.writeHead(SERVER_ERROR_CODE,RESPONSE_HEADER);
			res.end(JSON.stringify({ message: ex.toString(),stack:ex.stack.split("\n", 2).join(' ').replace(/ +/g, ' ').replace(/'+/g, '"'),
			 errorType:PROCESSING_ERROR_MESSAGE}));
		}
	}
	else{
		res.writeHead(NOT_FOUND_EROR_CODE, RESPONSE_HEADER);
		res.end(JSON.stringify({ message: ROUTE_NOT_FOUND_ERROR_MESSAGE}));
	}
	path=null,method=null,query=null,body=null,req=null,res=null
	callGarbageCollector();
}


module.exports={routes}