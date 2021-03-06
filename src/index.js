// PS: This is My First Project so forgive me if it is a little fuzzy
// PS: I appreciate any Constructive Critism (Mail: Jixerm4n@gmail.com || discord : Jixerm4n#6397)

import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';

import './config/db';
import constants from './config/constants';
import mocks from './mocks';
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import { decodeToken } from './services/auth';


// EVERY REQUEST TRIGERS THIS SINCE THIS IS A MIDDLEWARE
// THIS TAKES OUR TOKEN AND RETURNS THE USER OBJECT REQUESTING THE ACTION
// AND SETS IT TO CONTEXT OBJECT AS REQ.USER
// THE NEXT SIMPLY MEANS IT'S NOT OVER, GO TO THE NEXT MIDDLEWARE
async function auth(req,res, next) {
  try {
    const token = req.headers.authorization;
    if ( token != null) {
      const user = await decodeToken(token);
      req.user = user;
    } else {
      req.user = null;
    }
    return next(); 
  } catch (error) {
    throw error
  }
}

// INITIATING EXPRESS OFCOURSE
const app = express()


// APPLYING NEEDED MIDDLEWARES
app.use(bodyParser.json())
app.use(auth) // <== THIS IS THAT FUNCTION ABOVE

// A SIMPLE CONFIGURATION FOR VIEWING THE IMAGTES ON THE FRONTEND FROM BACKEND SERVER
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

// INITIATING THE APOLLO SERVER
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({
    user: req.user
  })
});

// MAKING OUR APOLLO SERVER TO USE MIDDLEWARES THAT EXPRESS SERVER IS USING
server.applyMiddleware({ app, path: constants.GRAPHQL_PATH });

// CREATING OUR HTTP SERVER
const httpServer = createServer(app)
// THIS IS FOR SUBSCRIPTION PURPUSES
// SINCE I'M NOT USING GRAPHQL SUBSCRIPTIONS THIS IS COMMENTED FOR NOW
// server.installSubscriptionHandlers(httpServer);


// STARTING THE SERVER
httpServer.listen(constants.PORT, () => {
  console.log(`Apollo Server on http://localhost:${constants.PORT}/graphql`);
})