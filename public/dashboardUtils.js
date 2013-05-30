function createDate(mSecs) {
  var result = new Date(0);
  result.setTime(mSecs);
  
  return result;
}

function convertDate(str) {  // expects input like 2013-01-31
   var year = str.slice(0,4);
   var month = str.slice(5,7);
   var day = str.slice(8,10);
  
   return Date.UTC(year, (month-1), day);
}