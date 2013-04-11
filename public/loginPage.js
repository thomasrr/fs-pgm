 
 function loadLoginPage() {
 var value = (checkLogin("fs-pgm", "dash")) ? "pass" : "fail";
 console.log ("Login: " + value);
 //  Description
 var descr = document.createElement('div');
 descr.setAttribute('class', 'halfPage');
 descr.setAttribute('id', 'description');
 descr.setAttribute('value', 'This will hold a description related to Metrics Dashboard including new features.');
 document.body.appendChild(descr);
 
 var userName = document.createElement('input');
 userName.setAttribute('type', 'text');
 userName.setAttribute('class', 'userInput');
 document.body.appendChild(userName);
 
 var password = document.createElement('input');
 password.setAttribute('type', 'password');
 password.setAttribute('class', 'userInput');
 document.body.appendChild(password);
 
 var login = document.createElement('input');
 login.setAttribute('type', 'submit');
 login.setAttribute('value', 'Login');
 login.setAttribute('id', 'login');
 login.setAttribute('class', 'login');
 login.onClick = processLogin;
 document.body.appendChild(login);
 
 var cancel = document.createElement('input');
 cancel.setAttribute('type', 'button');
 cancel.setAttribute('value', 'Cancel');
 cancel.setAttribute('id', 'cancel');
 cancel.setAttribute('class', 'cancel');
 cancel.onClick = processCancel;
 document.body.appendChild(cancel);
 
}

function processLogin() {
  loadMetricsPage();
}

function processCancel() {
  loadLoginPage();
}