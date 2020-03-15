const MongoClient = require( 'mongodb' ).MongoClient;
const credentials = require('./credentials.json');
const url = credentials.mongo;

var userDatabase;

module.exports = {

  initializeConnection: function( callback ) {
    MongoClient.connect( url,  { useNewUrlParser: true, useUnifiedTopology: true }, function( err, client ) {
        if (err) {
          console.error('An error occurred connecting to MongoDB: ', err);
      }
      userDatabase = client.db('users');
      userDatabase.collection("patients").createIndex( { phone: 1 }, { unique: true } );
      return callback( err );
    } );
  },

  userDatabase: () => {
    return userDatabase;
  }
};