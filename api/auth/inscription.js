import { db } from "@vercel/postgres";
import { Redis } from "@upstash/redis";
import { arrayBufferToBase64, stringToArrayBuffer } from "../../lib/base64";

export const config = {
  runtime: "edge",
};

const redis = Redis.fromEnv();

export default async function handler(request) {
  try {
    const { username, email, password } = await request.json();
    console.log(username, email, password);
    // verifier si l utilisateur n existe pas deja
    const client = await db.connect();
    const { rowCount, rows } =
      await client.sql`select * from users where username = ${username} or email=${email}`;
    if (rowCount !== 0) {
      const error = {
        code: "UNAUTHORIZED",
        message: "Identifiant  ou Email déja existant .",
      };
      return new Response(JSON.stringify(error), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    // generer un uuid :
    const newUserUuid = crypto.randomUUID().toString();
    // creer le hash du password -> base64
    const hash = await crypto.subtle.digest(
      "SHA-256",
      stringToArrayBuffer(username + password)
    );
    const hashed64 = arrayBufferToBase64(hash);
    // inserer l'utilisateur
    const insertResult =
      await client.sql`INSERT INTO users(username,password,email,created_on,last_login,external_id) values(${username},${hashed64},${email},NOW(),NOW(),${newUserUuid})  RETURNING *;`;
    //TODO: figure res of this
    if (insertResult.rowCount == 0) {
      const error = {
        code: "UNAUTHORIZED",
        message: "Erreur lors de la création de l'utilisateur .",
      };
      return new Response(JSON.stringify(error), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    const insertedUser = insertResult.rows[0];
    console.log(insertedUser);
    const token = crypto.randomUUID().toString();
    const user = {
      id: insertedUser.user_id,
      username: insertedUser.username,
      email: insertedUser.email,
      externalId: insertedUser.external_id,
    };
    await redis.set(token, user, { ex: 3600 });
    const userInfo = {};
    userInfo[user.id] = user;
    await redis.hset("users", userInfo);

    return new Response(
      JSON.stringify({
        token: token,
        username: username,
        externalId: insertedUser.external_id,
        id: insertedUser.user_id,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
