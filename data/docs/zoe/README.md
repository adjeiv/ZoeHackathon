URL: https://zoe.com/learn
# How to add ZOE (or other) content

ZOE's website is behind Cloudflare bot protection and can't be scraped, so add
excerpts you have rights to as files in this folder.

Format — one article per `.md` or `.txt` file:

    URL: https://zoe.com/learn/the-article-slug   (optional first line -> citation link)
    # Article title                               (first heading/line -> title)
    Paste the article text (or an excerpt) here...

The folder name (`zoe`) is used as the source label. Create sibling folders
(e.g. `data/docs/harvard/`) to add other trusted sources the same way.

Re-run `uv run python ingest.py` after adding files. Delete this README once you
add real content (otherwise it's indexed as a placeholder).


"https://zoe.com/learn/what-is-fibre",                                                                                 
"https://zoe.com/learn/gut-health",                                                                                    
"https://zoe.com/learn/what-are-processed-foods",                                                                      
"https://zoe.com/learn/blood-sugar-spikes",                                                                            
"https://zoe.com/learn/what-is-a-healthy-diet",