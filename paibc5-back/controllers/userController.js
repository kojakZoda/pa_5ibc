const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://koko:postgres@postgres:5432/pa5IBC')

class User extends Model { }


// Display Author create form on GET.
exports.create_user = function (req, res) {
    User.init({
        email: DataTypes.STRING,
        address: DataTypes.STRING,
        id: { type: DataTypes.STRING, primaryKey: true }
    }, { sequelize, modelName: 'user' });
    console.log(req.user);
    console.log(req.body);
    (async () => {
        await sequelize.sync();
        const user = await User.create({
            email: req.body.user.name,
            address: req.body.address,
            id: req.body.user.sub
        });
        console.log(user.toJSON());
    })();
    res.send('wow');
};


exports.user = function(req, res){
    res.json("oklm");
}



