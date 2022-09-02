const fs = require('fs');
const {DATE_PATTEERN}= require('./constants');
var exec = require('child_process').execSync;
const { callGarbageCollector } = require('./global');


const getLowerBoundTimeISOString=(targetDateString,filePath )=>{
	let iterations=0;
	let l=0,n=getByteCountOfFile(filePath), r=n-1;	
	const step=1;
	const [timeStamp1,,]=getLineFromFile(filePath,0)
	while(l<=r){
		
		const mid=Math.floor((l+r)/2);
		iterations=iterations+1;
		const [ midMinusOneTimeString,midTimeString, addedBytesT1,addedBytesT2]=getLineFromFile(filePath,mid);
		const target=(new Date(targetDateString)).getTime();
		const midTime=midTimeString? (new Date(midTimeString)).getTime(): null;
		const midMinusOneTime=midTimeString? (new Date(midMinusOneTimeString)).getTime() :null;
		if((new Date(timeStamp1)).getTime()===target){
			return [0,false];
		}
		else if(midTime!=null && midMinusOneTime!=null){
			
			if(midTime==target && (mid-1>-1 && midMinusOneTime==target)){
				r=mid-step;
			}
			else if(midTime==target && mid-1==-1){
				return [mid+(addedBytesT2- addedBytesT1),false];
			}
			else if(midTime==target && (mid-1>-1 && midMinusOneTime<target)){
				return [mid+addedBytesT2,false];
			}
			else if(midTime>target && ((mid-1>-1 && midMinusOneTime<target) || mid-1==-1)){
				return [mid,false];
			}
			else if(midTime< target){
				l=mid+step;
			}
			else if(midTime> target){
				r=mid-step;
			}
		}else if(midTime==null || midMinusOneTime==null){
			return [n-(256),false];
		}
	}
	return [n,false];
}


const getByteCountOfFile=(filePath)=>{
	let byteCount=-1;
	byteCount=(+(exec('wc  -c '+filePath).toString().split(" ")[1]))
	return byteCount
}

const getLineFromFile=(filePath, idx)=>{
	let buffer = new Buffer.alloc(300);
	let timeStamp1='';
	let timeStamp2='';
	let extraPrefixByteLengthForT1=0;
	let extraPrefixByteLengthForT2=0;
	const fd=fs.openSync(filePath, 'r+',);

	const byteCount=fs.readSync(fd, buffer, 0, buffer.length,idx);
				
	if (byteCount > 0) {
		let line=buffer.slice(0, byteCount).toString();
		let dateStrings=line.split("\n")
		.filter((dateString)=>{
			return (DATE_PATTEERN.test(dateString))
		})
		.map(lineI=>{
			return lineI.split("Z ")[0]+"Z"
		})


		timeStamp1=dateStrings[0];
		timeStamp2=dateStrings[1];
		
		const extraPrefixForT1=timeStamp1? line.split(timeStamp1)[0]:'';
		extraPrefixByteLengthForT1= timeStamp1? Buffer.byteLength(extraPrefixForT1,'utf-8'):0


		const extraPrefixForT2=timeStamp2? line.split(timeStamp2)[0]:'';
		extraPrefixByteLengthForT2= timeStamp2? Buffer.byteLength(extraPrefixForT2,'utf-8'):0
	}
	buffer.fill('0')
	buffer=null

	try {
		fs.closeSync(fd);
		// console.log("\n> File Closed successfully");
	  } catch (err) {
		// console.error('Failed to close file', err);
	  }
	callGarbageCollector()
	return [timeStamp1,timeStamp2, extraPrefixByteLengthForT1, extraPrefixByteLengthForT2];
}

const getLowerBoundTimeFromInputTime=(dateTimeString,filePath)=>{
	const [bufferPosition,]=getLowerBoundTimeISOString(dateTimeString,filePath)
	const [lowerBoundDateTimeString, , addedBytesT1,]=getLineFromFile(filePath,bufferPosition);
	return [lowerBoundDateTimeString, bufferPosition+addedBytesT1]
}

module.exports={
	getLowerBoundTimeISOString,
	getByteCountOfFile,
	getLineFromFile,
	getLowerBoundTimeFromInputTime
}