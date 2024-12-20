const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require("./routes/user-routes");
const categoriesRoutes = require('./routes/categories-routes');
const subcategoriesRoutes = require('./routes/subcategories-routes');
const cattleRoutes = require('./routes/cattle-routes');
const transactionRoutes = require('./routes/transaction-routes');
const slaughterRoutes = require('./routes/slaughter-routes');
const transferRoutes = require('./routes/transfer-routes');
const recoveryRoutes = require('./routes/recovery-routes');
const lossRoutes = require('./routes/loss-routes');
const accountRoutes = require('./routes/account-routes');
const ranchesRoutes = require('./routes/ranches-routes');

const app = express();

app.use(bodyParser.json());
app.use('/user', usersRoutes);
app.use('/', categoriesRoutes);
app.use('/', subcategoriesRoutes);
app.use('/cattle', cattleRoutes);
app.use('/transactions', transactionRoutes);
app.use('/slaughter', slaughterRoutes);
app.use('/transfer', transferRoutes);
app.use('/recovery', recoveryRoutes);
app.use('/death', lossRoutes);
app.use('/account', accountRoutes);
app.use('/ranches', ranchesRoutes);



app.use((req, res, next) => {
    const error = new HttpError('could not find a route', 404); 
    throw error;
    });

app.use((error, req, res, next)=>{   
    if (res.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'unkown erroor occured'})
    });
    

app.listen(7000, () => {
    console.log('Server running on port 7000');
});













