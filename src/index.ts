import session from 'express-session';
import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { __node__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import cors from 'cors'

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up()
  
  const app = express()

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }))
  app.use(session({
    secret: 'asdnksdvn239821731jnsdc',
    resave: false,
    name: 'qid',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
      httpOnly: true,
      secure: __node__, // cookie only works in https
      sameSite: 'lax' // csrf
    },
    saveUninitialized: false
  }, ))

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [ PostResolver, UserResolver],
      validate: false
    }),
    context: ({req, res}): MyContext => ({ em: orm.em, req, res })
  })
  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: false
    }
  })

  app.listen(4000, () => {
    console.log('Server started on localhost:4000');
  })

}

main().catch(err => {
  console.error(err)
})
