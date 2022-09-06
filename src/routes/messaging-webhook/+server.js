import { error } from '@sveltejs/kit';
import { v4 as uuid } from '@lukeed/uuid';

/** @type {import('./$types').RequestHandler} */


export const GET = async ({ url, platform, request }) => {

    const kvLogId = uuid()

    const timezone = request.cf && request.cf.timezone;
    const localized_date = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));

    const mode = url.searchParams.get('hub.mode') || null
    const token = url.searchParams.get('hub.verify_token') || null
    const challenge = url.searchParams.get('hub.challenge') || null

    const verifyToken = "8fb2e86ae8884c1da4e7f30bc0cea7cf"

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === verifyToken) {
            // Respond with the challenge token from the request
            //console.log("WEBHOOK_VERIFIED");
            platform.env.LOGS && await platform.env.LOGS.put(`GET_${kvLogId}`, `WEBHOOK_VERIFIED | ${localized_date.toGMTString()} | mode: ${mode} token: ${token} challenge: ${challenge}`)
            return new Response(String(challenge));
            //res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            //res.sendStatus(403);

            platform.env.LOGS && await platform.env.LOGS.put(`GET_ERROR_${kvLogId}`, `TOKEN_DO_NOT_MATCH | ${localized_date.toGMTString()} | mode: ${mode} token: ${token} challenge: ${challenge}`)
            throw error(403);
        }
    }
    return new Response(String("Nothing from Facebook"));
}

export const POST = async ({ platform, request }) => {
    const kvLogId = uuid()
    try {
        const requestBody = await request.json()
        //console.log('POST: Someone is pinging me!');
        platform.env.LOGS && await platform.env.LOGS.put(`POST_${kvLogId}`, JSON.stringify(requestBody))
        return new Response(String("OK"));
    } catch (error) {
        platform.env.LOGS && await platform.env.LOGS.put(`POST_ERROR_${kvLogId}`, JSON.stringify(error))
        throw error(500);
    }
}