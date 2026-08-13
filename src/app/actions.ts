"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { CommentParentType, MarketCategory, Sentiment } from "@/lib/types";

const DEMO = {
  error:
    "Demo mode — connect your Supabase project (see README) to enable sign-in and posting.",
};

type Result = { error?: string; ok?: boolean };

// ---- Auth -----------------------------------------------------------------

export async function signUp(_prev: Result, formData: FormData): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim() || username;
  if (!email || !password || !username)
    return { error: "Email, password and username are required." };
  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: displayName } },
  });
  if (error) return { error: error.message };
  redirect("/");
}

export async function signIn(_prev: Result, formData: FormData): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/");
}

export async function signOut() {
  const sb = await getServerSupabase();
  if (sb) await sb.auth.signOut();
  redirect("/");
}

// ---- Comments -------------------------------------------------------------

export async function addComment(
  parentType: CommentParentType,
  parentId: string,
  body: string,
  replyTo: string | null,
): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Please sign in to comment." };
  if (!body.trim()) return { error: "Comment cannot be empty." };
  const { error } = await sb.from("comments").insert({
    parent_type: parentType,
    parent_id: parentId,
    author_id: user.id,
    body: body.trim(),
    reply_to: replyTo,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- Likes ----------------------------------------------------------------

export async function toggleLike(
  targetType: "analysis" | "community" | "comment",
  targetId: string,
): Promise<Result & { liked?: boolean }> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Please sign in to like." };
  const { data: existing } = await sb
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();
  if (existing) {
    await sb.from("likes").delete().eq("id", existing.id);
    return { ok: true, liked: false };
  }
  await sb
    .from("likes")
    .insert({ user_id: user.id, target_type: targetType, target_id: targetId });
  return { ok: true, liked: true };
}

// ---- Follows --------------------------------------------------------------

export async function toggleFollow(followingId: string): Promise<Result & { following?: boolean }> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Please sign in to follow." };
  if (user.id === followingId) return { error: "You can't follow yourself." };
  const { data: existing } = await sb
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle();
  if (existing) {
    await sb
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", followingId);
    return { ok: true, following: false };
  }
  await sb
    .from("follows")
    .insert({ follower_id: user.id, following_id: followingId });
  return { ok: true, following: true };
}

// ---- Analysis -------------------------------------------------------------

export async function createAnalysis(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Please sign in to publish an analysis." };
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    market: String(formData.get("market") ?? "general") as MarketCategory,
    sentiment: String(formData.get("sentiment") ?? "neutral") as Sentiment,
    related_news_id: (formData.get("related_news_id") as string) || null,
    author_id: user.id,
  };
  if (!payload.title || !payload.body)
    return { error: "Title and body are required." };
  const { data, error } = await sb
    .from("analysis")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: error.message };
  redirect(`/analysis/${data.id}`);
}

// ---- Community ------------------------------------------------------------

export async function createPost(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Please sign in to post." };
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    market: String(formData.get("market") ?? "general") as MarketCategory,
    author_id: user.id,
  };
  if (!payload.title || !payload.body)
    return { error: "Title and body are required." };
  const { data, error } = await sb
    .from("community_posts")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: error.message };
  redirect(`/community/post/${data.id}`);
}

// ---- Admin ----------------------------------------------------------------

export async function adminCreateNews(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    source: String(formData.get("source") ?? "").trim(),
    source_url: String(formData.get("source_url") ?? "").trim(),
    market: String(formData.get("market") ?? "general") as MarketCategory,
  };
  if (!payload.title || !payload.summary)
    return { error: "Title and summary are required." };
  const { error } = await sb.from("news").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/news");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeleteNews(id: string): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const { error } = await sb.from("news").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/news");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeletePost(id: string): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const { error } = await sb.from("community_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeleteComment(id: string): Promise<Result> {
  const sb = await getServerSupabase();
  if (!sb) return DEMO;
  const { error } = await sb.from("comments").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}
