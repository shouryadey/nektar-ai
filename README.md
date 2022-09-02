## APPROACH:
#### Exposed API:
 "/api/getLogsInTimeRange" with two query params-> timeStart and timeEnd (ISO String format, preferably). cURL provided below.




#### The idea:
is to use binary search in the logs (using sorted order of time string) to get the approximate start and end positions in the file 'example.tx'.
Used streams module to make sure the file does not needed to be loaded in main memory.




 #### Using transfrom streams to:
 - Convert file text to new lines
 - Filter logs (few logs will be extra after step 1 as approximate position has been found)
 - Convert each lines to string
 - Writing in response writable stream


```text
Note: To get the data large by client without crashing, proper client needs to be set up to fetch response in chunks
```






## SCOPE OF IMPROVEMENT:
Scope of improvement: Memory leakage could have been reduced, 
Ex: files can be opened and closed at the start and end of applications respectively. Was not possible due to time constrains





## HOW TO USE:
In the root directoy use command:
```bash
node --expose-gc app.js 
```

API cURL: 
```bash
curl --location --request GET 'http://127.0.0.1:3003/api/getLogsInTimeRange?timeStart=2020-01-18T06:31:16.495Z&timeEnd=2020-01-18T07:33:31.107Z'
```

Currently using hardcoded filname: 'example.txt', available in constants.js file. This could have been handled in a better way.

