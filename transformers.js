const {DATE_PATTEERN}= require('./constants');
const { Transform } = require('stream');

const filterOutLogsBasedOnDateRange=(startDateString, endDateString)=>{
	const startTime=(new Date(startDateString)).getTime();
	const endTime=(new Date(endDateString)).getTime();

	let filterStream = new Transform( { objectMode: true } );

	filterStream._transform = function(chunkArray, encoding, done) {
		allowedChunks=chunkArray.filter(chunk=>{
			datePresentArray=chunk.match(DATE_PATTEERN);
			if(!datePresentArray) return false

			const dateString=datePresentArray[0];
			const dateTime= (new Date(dateString)).getTime();
			if(dateTime>=startTime && dateTime<=endTime){
				return true;
			}
		})
	
		return done(null,allowedChunks);
	};

	filterStream._flush = function(done) {
		done();
	};
	
	return filterStream;
}

const transformStringToNewLine=()=>{
	let toNewLineStream = new Transform( { objectMode: true } );
	toNewLineStream._transform = function(chunk, encoding, done) {
		var strData = chunk.toString();

		if (this._invalidLine) {
			strData = this._invalidLine + strData;
		};

		var objLines = strData.split("\n"); 
		this._invalidLine = objLines.splice(objLines.length-1, 1)[0];  
		this.push(objLines);

		done();
	};
	toNewLineStream._flush = function(done) {
		if (this._invalidLine) {   
			this.push([this._invalidLine]); 
		};

		this._invalidLine = null;
		done();
	};
	return toNewLineStream;
}

const transformArraysToString=()=>{
	let lineToStringStream = new Transform( { objectMode: true } );
	lineToStringStream._transform = function(chunk, encoding, done) {
			var stringArray = chunk;
			var stringValue = stringArray.join("\n");  
			done(null, stringValue);
	};
	lineToStringStream._flush = function(done) {
			done();
	};
	return lineToStringStream;
}

module.exports={
	filterOutLogsBasedOnDateRange,
	transformArraysToString,
	transformStringToNewLine
}