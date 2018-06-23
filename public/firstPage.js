function userNameCheck(event,id) {
    if ((event.keyCode>64 && event.keyCode<91)||(event.keyCode == 32)||(event.keyCode == 8)||(event.keyCode == 16))
    {
        document.getElementById('alertUser').innerHTML = 'Username is allow' ;
    }else {
        document.getElementById('alertUser').innerHTML = 'You are allow only alphabet & space' ;
        document.getElementById(id).value = '';
    }
}
function smallCase(id){
    document.getElementById(id).value = document.getElementById(id).value.toLowerCase();
}
function passwordConfirmation(confirmPassword, firstInput){
    if (document.getElementById(firstInput).value === document.getElementById(confirmPassword).value){
        document.getElementById('button').disabled = false;
        document.getElementById('passwordConfirmation').innerHTML = '';
    }else {
        document.getElementById('button').disabled = true;
        document.getElementById('passwordConfirmation').innerHTML = '<strong>Password not match</strong>';
    }
}
function passwordCheck(id){
    var password = document.getElementById(id).value,
        passwordStrength = 0,
        caseList = ["[0-9]", "[A-Z]", "[a-z]", "[$@$!%*#?&]"];
    for (var i=0; i<4; i++){
        if (new RegExp(caseList[i]).test(password)){
            passwordStrength++;
        }
    }
    console.log(passwordStrength);
    switch (passwordStrength) {
        case 0 :
            document.getElementById('passwordCheck').innerHTML = "" ;
            break;
        case 1 :
            document.getElementById('passwordCheck').innerHTML = "<strong>Weak Password</strong>" ;
            document.getElementById('passwordCheck').style.color = 'red' ;
            break;
        case 2 :
            document.getElementById('passwordCheck').innerHTML = "<i>Good Password</i>" ;
            document.getElementById('passwordCheck').style.color = 'darkorange' ;
            break;
        case 3 :
            document.getElementById('passwordCheck').innerHTML = "<strong>Strong Password</strong>" ;
            document.getElementById('passwordCheck').style.color = 'green' ;
            break;
        case 4 :
            document.getElementById('passwordCheck').innerHTML = "<b>Very Strong Password</b>" ;
            document.getElementById('passwordCheck').style.color = 'darkgreen' ;
            break;
    }
    password = passwordStrength =undefined;
    caseList = undefined ;
}
