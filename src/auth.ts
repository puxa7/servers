import argon2 from 'argon2';
import jwt from "jsonwebtoken";
import type { JwtPayload } from 'jsonwebtoken';

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        console.error('Błąd hashowania:', err);
        throw err;
    }

}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try {
        if (await argon2.verify(hash, password)) {
            // password match
            return true;
        } else {
            // password did not match
            return false;
        }
    } catch (err) {
        // internal failure
        console.error('verification error:', err);
        throw err;
    }
    
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {

    
    const iat = Math.floor(Date.now()/1000); //time in seconds
    const exp = iat + expiresIn;
        

    const tokenPayload: payload =  {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: exp
    }

    return jwt.sign(tokenPayload, secret);
}

export function validateJWT(tokenString: string, secret: string): string{
    
    const decoded = jwt.verify(tokenString, secret) as JwtPayload;

    const userID = decoded.sub;

     if (typeof userID !== "string") {
        throw new Error("Invalid token payload: missing subject");
    }

    return userID;

}

//const hashed = await hashPassword('mojeHaslo123');

//const ok = await checkPasswordHash("mojeHaslo123", hashed)
//console.log(ok);