const envConfig = require('./env');

module.exports = {
  options: {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
  url: envConfig.MONGO_URI,
};
