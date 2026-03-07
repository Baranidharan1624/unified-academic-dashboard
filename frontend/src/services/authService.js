export function login(email,password){

const admin = {
email:"admin123@gmail.com",
password:"123456",
role:"admin"
};

if(email === admin.email && password === admin.password){
return admin;
}

return null;
}