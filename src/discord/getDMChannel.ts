import { client } from "./client";

export async function getDMChannel(userID: string) {
    const userObj =
        client.users.cache.get(userID) || (await client.users.fetch(userID));
    return userObj.dmChannel || (await userObj.createDM());
}