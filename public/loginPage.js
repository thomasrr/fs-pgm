 
 function loadLoginPage() {
 //  Description
 var descr = document.createElement('div');
 descr.setAttribute('class', 'halfPage');
 descr.setAttribute('value', 'This will hold a description related to Metrics Dashboard including new features.');
 
 var userName = document.createElement('input');
 userName.setAttribute('type', 'text');
 userName.setAttribute('class', 'userInput');
 
 var password = document.createElement('input');
 password.setAttribute('type', 'password');
 password.setAttribute('class', 'userInput');
 
 var login = document.createElement('input');
 login.setAttribute('type', 'button');
 login.setAttribute('value', 'Login');
 login.setAttribute('id', 'login');
 login.onClick = processLogin;
 
 var cancel = document.createElement('input');
 cancel.setAttribute('type', 'button');
 cancel.setAttribute('value', 'Cancel');
 cancel.setAttribute('id', 'cancel');
 cancel.onClick = processCancel;
 
}

function processLogin() {
}

function processCancel() {
  loadLoginPage();
}