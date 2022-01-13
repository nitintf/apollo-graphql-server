import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __node__ } from './constants';
import { Post } from './entities/Post';
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname,'./migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: 'reddit',
  type: 'postgresql',
  debug: !__node__,
  user: 'postgres',
  password: 'Shadow@0802'
} as Parameters<typeof MikroORM.init>[0]
