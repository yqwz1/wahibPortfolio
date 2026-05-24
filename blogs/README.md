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
     "excerpt":  "One short paragraph that shows on the card.",
     "tags":     ["unity", "tip"],
     "hero":     "blogs/images/unity-tip-1.png",
     "files":    [
       { "name": "Sample project", "url": "blogs/files/unity-tip-1.zip" }
     ]
   }
   ```

   - `hero` is optional. Leave empty (`""`) to show the placeholder.
   - `files` is optional. Each entry becomes a download button at the bottom of the post.

3. **Commit & push** to `main`. The blog appears on the site immediately.

## Adding images inside a post

Drop the image in `blogs/images/`, then reference it in the markdown:

```markdown
![Caption text](blogs/images/screenshot.png)
```

## Adding downloadable files

Drop the file in `blogs/files/`, then add it to the `files` array in `posts.json` as shown above.

## Search, sort and likes

The blog grid supports:

- **Search** — by post title, excerpt, or tag (live filter)
- **Sort** — Newest first / Oldest first / Most liked
- **Likes** — each post has a global like counter (one like per browser, tracked via [Abacus](https://abacus.jasoncameron.dev) free counter API)

No setup needed — likes work out of the box. The "liked" state is stored in `localStorage` so a visitor can't like the same post twice from the same browser.
