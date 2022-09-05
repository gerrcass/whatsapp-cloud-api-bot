import { error } from '@sveltejs/kit';
import { v4 as uuid } from '@lukeed/uuid';

/** @type {import('./$types').RequestHandler} */

export const GET = async ({ url, platform, request }) => {

    const kvlogId = uuid()

    const timezone = request.cf && request.cf.timezone;
    let localized_date = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));

    const mode = url.searchParams.get('hub.mode') || null
    const token = url.searchParams.get('hub.verify_token') || null
    const challenge = url.searchParams.get('hub.challenge') || null

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === config.verifyToken) {
            // Respond with the challenge token from the request
            //console.log("WEBHOOK_VERIFIED");
            platform.env.LOGS && await platform.env.LOGS.put(kvlogId, `WEBHOOK_VERIFIED | ${localized_date.toGMTString()} | mode: ${mode} token: ${token} challenge: ${challenge}`)
            return new Response(String(challenge));
            //res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            //res.sendStatus(403);
            throw error(403);
        }
    }
    return new Response(String("Nothing from Facebook"));
}