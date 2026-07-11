#!/usr/bin/env python3
"""Publish pending activities to Instagram and Facebook via the Meta Graph API.

Reads and rewrites assets/data/actividades.json in place. Only touches entries
where publicacion.<canal>.estado == "pendiente" (fan-out publisher; the bot is
the single writer of new activities, this script is the single writer of
publication status). Images are fetched by Meta from raw.githubusercontent.com,
so no separate image hosting is needed and there is no GitHub Pages build lag.

Required environment variables:
  FB_PAGE_ID            Facebook Page id
  FB_PAGE_ACCESS_TOKEN  Page access token (also used for the linked IG account)
  IG_USER_ID            Instagram Business Account id (optional: skips IG if unset)
  GITHUB_REPOSITORY     "owner/repo" (set automatically by GitHub Actions)
  GITHUB_REF_NAME        branch name (set automatically by GitHub Actions)
"""
import json
import os
import sys
import time

import requests

GRAPH = "https://graph.facebook.com/v19.0"
JSON_PATH = "assets/data/actividades.json"
MAX_ATTEMPTS = 5

FB_PAGE_ID = os.environ.get("FB_PAGE_ID")
FB_PAGE_ACCESS_TOKEN = os.environ.get("FB_PAGE_ACCESS_TOKEN")
IG_USER_ID = os.environ.get("IG_USER_ID")
REPO = os.environ.get("GITHUB_REPOSITORY")
BRANCH = os.environ.get("GITHUB_REF_NAME", "main")


def raw_url(path: str) -> str:
    return f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{path}"


def activity_images(activity: dict) -> list:
    images = activity.get("imagenes") or []
    if images:
        return images
    return [activity["imagen"]] if activity.get("imagen") else []


def caption_for(activity: dict) -> str:
    tags = " ".join(f"#{t.replace(' ', '')}" for t in activity.get("tags", []))
    parts = [activity.get("titulo", ""), activity.get("descripcion", ""), tags]
    return "\n\n".join(p for p in parts if p).strip()


def publish_facebook(activity: dict):
    images = activity_images(activity)
    if not images:
        return None, "sin imágenes"

    resp = requests.post(
        f"{GRAPH}/{FB_PAGE_ID}/photos",
        data={
            "url": raw_url(images[0]),
            "caption": caption_for(activity),
            "access_token": FB_PAGE_ACCESS_TOKEN,
        },
        timeout=30,
    )
    if not resp.ok:
        return None, resp.text[:300]
    body = resp.json()
    return body.get("post_id") or body.get("id"), None


def publish_instagram(activity: dict):
    if not IG_USER_ID:
        return None, "IG_USER_ID no configurado"

    images = activity_images(activity)
    if not images:
        return None, "sin imágenes"
    caption = caption_for(activity)

    if len(images) == 1:
        resp = requests.post(
            f"{GRAPH}/{IG_USER_ID}/media",
            data={
                "image_url": raw_url(images[0]),
                "caption": caption,
                "access_token": FB_PAGE_ACCESS_TOKEN,
            },
            timeout=30,
        )
        if not resp.ok:
            return None, resp.text[:300]
        creation_id = resp.json()["id"]
    else:
        child_ids = []
        for img in images[:10]:  # Instagram carousel limit
            r = requests.post(
                f"{GRAPH}/{IG_USER_ID}/media",
                data={
                    "image_url": raw_url(img),
                    "is_carousel_item": "true",
                    "access_token": FB_PAGE_ACCESS_TOKEN,
                },
                timeout=30,
            )
            if not r.ok:
                return None, r.text[:300]
            child_ids.append(r.json()["id"])

        resp = requests.post(
            f"{GRAPH}/{IG_USER_ID}/media",
            data={
                "media_type": "CAROUSEL",
                "children": ",".join(child_ids),
                "caption": caption,
                "access_token": FB_PAGE_ACCESS_TOKEN,
            },
            timeout=30,
        )
        if not resp.ok:
            return None, resp.text[:300]
        creation_id = resp.json()["id"]

    publish_resp = requests.post(
        f"{GRAPH}/{IG_USER_ID}/media_publish",
        data={"creation_id": creation_id, "access_token": FB_PAGE_ACCESS_TOKEN},
        timeout=30,
    )
    if not publish_resp.ok:
        return None, publish_resp.text[:300]
    return publish_resp.json().get("id"), None


PUBLISHERS = {"facebook": publish_facebook, "instagram": publish_instagram}


def process_entry(activity: dict, channel: str, publish_fn) -> bool:
    """Try to publish one channel of one activity. Returns True if the JSON changed."""
    entry = activity.get("publicacion", {}).get(channel)
    if not entry or entry.get("estado") != "pendiente":
        return False

    print(f"Publishing {activity.get('id')} -> {channel} ...")
    post_id, error = publish_fn(activity)

    if error is None:
        print(f"  OK: {post_id}")
        entry["estado"] = "publicado"
        entry["post_id"] = post_id
        entry.pop("error", None)
        entry.pop("intentos", None)
        return True

    attempts = entry.get("intentos", 0) + 1
    entry["intentos"] = attempts
    entry["error"] = error
    if attempts >= MAX_ATTEMPTS:
        print(f"  ERROR (attempt {attempts}/{MAX_ATTEMPTS}, giving up): {error}")
        entry["estado"] = "error"
    else:
        print(f"  ERROR (attempt {attempts}/{MAX_ATTEMPTS}, will retry): {error}")
        # estado stays "pendiente" so the next scheduled run retries automatically.
    return True


def main() -> int:
    missing = [k for k in ("FB_PAGE_ID", "FB_PAGE_ACCESS_TOKEN") if not os.environ.get(k)]
    if missing:
        print(f"Missing required env vars: {', '.join(missing)}. Nothing to do.")
        return 0

    with open(JSON_PATH, encoding="utf-8") as f:
        activities = json.load(f)

    changed = False
    for activity in activities:
        for channel, publish_fn in PUBLISHERS.items():
            if process_entry(activity, channel, publish_fn):
                changed = True
                time.sleep(2)  # be polite to the API

    if changed:
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(activities, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("actividades.json updated.")
    else:
        print("Nothing to publish.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
