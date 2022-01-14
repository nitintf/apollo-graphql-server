import { ObjectType } from 'type-graphql';
import { User } from '../entities/User'
import { MyContext } from '../types'
import { Resolver, Mutation, InputType, Field, Arg, Ctx } from 'type-graphql'
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  username: string
  @Field(() => String)
  password: string
}


@ObjectType()
class FieldError {
  @Field(() => String)
  field: string
  @Field(() => String)
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[]

  @Field(() => User, {nullable: true})
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em}: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2"
          }
        ]
      }
    }
    if (options.password.length <= 4) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 4"
          }
        ]
      }
    }

    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(
      User,
      {
        username: options.username,
        password: hashedPassword
      })
    try {
      await em.persistAndFlush(user)
    } catch (err) {
      if (err.code === '23505') { //|| err.detail.includes("already exists")) {
        // duplicate user error
        return {
          errors: [
            {
              field: "username",
              message: "username already taken"
            }
          ]
        }
      }    
      console.log('message', err.message);
    }
    
    return {
      user
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: 'username doesnt exist'
        }]
      }
    }
    
    const valid = await argon2.verify(user.password, options.password)

    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect Password'
          }
        ]
      }
    }
    
    req.session.userId = user.id

    return {
      user
    }
  }  
}
