import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = process.env.ALGORITHM;
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export const encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
}

export const decrypt = (text, dKey, ivKey) => {
    let encryptedText = Buffer.from(text, "hex");
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(dKey), Buffer.from(ivKey));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export { key, iv };