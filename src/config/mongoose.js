const envConfig = require('./env');

module.exports = {
  options: {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
  mongoUri: envConfig.MONGO_URI,
};
