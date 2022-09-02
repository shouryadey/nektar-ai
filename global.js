const callGarbageCollector=()=>{
	try {
		if (global.gc) {
			global.gc();
			// console.log('Requesting gc to free-up unsed memory');
		}
	  } catch (e) {
		console.log("Error at garbage collection",e);
		process.exit();
	  }
}

module.exports={
	callGarbageCollector,
}