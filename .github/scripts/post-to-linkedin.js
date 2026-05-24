#!/usr/bin/env node
/**
 * post-to-linkedin.js
 *
 * Two modes:
 *   detect <prevPostsJson> <currPostsJson>   → prints newly added slugs (one per line)
 *   post                                     → reads NEW_SLUGS env, posts each to LinkedIn
 *
 * Required env (for `post`):
 *   LINKEDIN_ACCESS_TOKEN  — OAuth 2.0 token with w_member_social scope
 *   LINKEDIN_PERSON_URN    — your URN, e.g. "urn:li:person:abcDEF123"
 *   SITE_URL               — base URL of your site, e.g. "https://wahib.dev"
 */

const fs   = require('fs');
const path = require('path');

const mode = process.argv[2];

function readJSON(p){
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch { return { posts: [] }; }
}

function detect(){
    const prev = readJSON(process.argv[3]);
    const curr = readJSON(process.argv[4]);
    const prevSlugs = new Set((prev.posts || []).map(p => p.slug));
    const newPosts  = (curr.posts || []).filter(p => !prevSlugs.has(p.slug));
    process.stdout.write(newPosts.map(p => p.slug).join('\n'));
}

async function postOne(post, siteUrl, token, personUrn){
    const url      = `${siteUrl.replace(/\/$/, '')}/#blog-${post.slug}`;
    const tagsLine = (post.tags || []).map(t => '#' + t.replace(/[^a-zA-Z0-9]/g, '')).join(' ');
    const text =
        `📝 New post: ${post.title}\n\n` +
        `${post.excerpt || ''}\n\n` +
        `Read it here → ${url}\n\n` +
        (tagsLine ? tagsLine : '');

    const body = {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text },
                shareMediaCategory: 'ARTICLE',
                media: [{
                    status: 'READY',
                    originalUrl: url,
                    title:       { text: post.title },
                    description: { text: post.excerpt || '' },
                }],
            },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
            'Authorization':            `Bearer ${token}`,
            'Content-Type':             'application/json',
            'X-Restli-Protocol-Version':'2.0.0',
        },
        body: JSON.stringify(body),
    });
    const txt = await res.text();
    if(!res.ok){
        throw new Error(`LinkedIn API ${res.status}: ${txt}`);
    }
    console.log(`✓ Posted ${post.slug} — LinkedIn response: ${txt.slice(0, 200)}`);
}

async function post(){
    const token     = process.env.LINKEDIN_ACCESS_TOKEN;
    const personUrn = process.env.LINKEDIN_PERSON_URN;
    const siteUrl   = process.env.SITE_URL;
    const slugs     = (process.env.NEW_SLUGS || '').split('\n').map(s=>s.trim()).filter(Boolean);

    if(!token || !personUrn || !siteUrl){
        throw new Error('Missing one of: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN, SITE_URL');
    }
    if(slugs.length === 0){
        console.log('No new posts to publish.');
        return;
    }

    const all = readJSON(path.join('blogs', 'posts.json')).posts || [];
    for(const slug of slugs){
        const post = all.find(p => p.slug === slug);
        if(!post){ console.warn('Slug not found in posts.json: '+slug); continue; }
        try {
            await postOne(post, siteUrl, token, personUrn);
        } catch(err){
            console.error(`✗ Failed to post ${slug}:`, err.message);
            process.exitCode = 1;
        }
    }
}

(async () => {
    if(mode === 'detect')      detect();
    else if(mode === 'post')   await post();
    else {
        console.error('Usage: node post-to-linkedin.js detect <prev.json> <curr.json>');
        console.error('   or: node post-to-linkedin.js post   (reads env)');
        process.exit(1);
    }
})().catch(e => { console.error(e); process.exit(1); });
