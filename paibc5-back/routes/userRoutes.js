module.exports = function(app){
    const user = require("../controllers/userController");
    app.post("/user", user.create_user);
}