# Blog system

## How to add a new post

1. **Write the content** — create `blogs/posts/<slug>.md` (e.g. `blogs/posts/unity-tip-1.md`). Standard Markdown: `#` headings, `**bold**`, `*italic*`, lists, `[links](url)`, `![images](path)`, code fences with triple backticks.

2. **Register the post** — open `blogs/posts.json` and add an entry at the top of the `posts` array:

   ```json
   {
     "slug":     "unity-tip-1",
     "title":    "The Unity tip I wish I knew sooner",
     "date":     "2026-06-01",
     "readTime": "4 min read",
     "excerpt":  "One short paragraph that shows on the card and in the LinkedIn post.",
     "tags":     ["unity", "tip"],
     "hero":     "blogs/images/unity-tip-1.png",
     "files":    [
       { "name": "Sample project", "url": "blogs/files/unity-tip-1.zip" }
     ]
   }
   ```

   - `hero` is optional. Leave empty (`""`) to show the placeholder.
   - `files` is optional. Each entry becomes a download button at the bottom of the post.

3. **Commit & push** to `main`. The blog appears on the site immediately, and the GitHub Action will post it to LinkedIn (see setup below).

## Adding images inside a post

Drop the image in `blogs/images/`, then reference it in the markdown:

```markdown
![Caption text](blogs/images/screenshot.png)
```

## Adding downloadable files

Drop the file in `blogs/files/`, then add it to the `files` array in `posts.json` as shown above.

---

## LinkedIn auto-posting — one-time setup

The GitHub Action at `.github/workflows/linkedin-post.yml` posts each new blog to LinkedIn automatically. You need to set it up once:

### 1. Create a LinkedIn app

1. Go to <https://www.linkedin.com/developers/apps> and click **Create app**.
2. Fill in the name (e.g. "Wahib Portfolio Auto-Post"), associate it with your personal LinkedIn page, upload any logo.
3. Under **Products**, request **Share on LinkedIn** and **Sign In with LinkedIn using OpenID Connect**.

### 2. Get an access token

The easiest path is to use the LinkedIn OAuth playground or follow [the official 3-legged OAuth flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow). You need a token with the `w_member_social` scope.

> ⚠ Access tokens expire after **60 days**. When that happens, the workflow will fail; just regenerate the token and update the GitHub Secret.

### 3. Find your Person URN

With the token, run:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.linkedin.com/v2/userinfo
```

The response includes `"sub": "abc123XYZ"`. Your URN is `urn:li:person:abc123XYZ`.

### 4. Add GitHub Secrets

In your repo → **Settings → Secrets and variables → Actions → New repository secret**, add:

| Name                    | Value                                    |
|-------------------------|------------------------------------------|
| `LINKEDIN_ACCESS_TOKEN` | The OAuth token from step 2              |
| `LINKEDIN_PERSON_URN`   | `urn:li:person:abc123XYZ` from step 3    |
| `SITE_URL`              | Your live site URL (e.g. `https://wahib.dev`) |

### 5. Test it

Add a new entry to `blogs/posts.json`, commit, push. Check the **Actions** tab on GitHub — you should see the workflow run and the post appear on your LinkedIn feed within a minute.

---

## Manual share fallback

Every blog post in the modal has a **"Share on LinkedIn →"** button at the bottom. That works without any setup — it just opens LinkedIn's share dialog pre-filled with the post URL.

So even if the automatic workflow is broken or you haven't set it up yet, you can always share manually with one click.
