const bcrypt = require("bcryptjs");

const hash = "$2a$12$U893iuIllNHabeQuSWhBYORCACiA1ZUTYiv.hyqI2Z.jQ3k1vt0nG";

bcrypt.compare("Admin1234!", hash).then(console.log);