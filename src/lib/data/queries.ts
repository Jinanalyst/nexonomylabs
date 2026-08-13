import { getServerSupabase } from "@/lib/supabase/server";
import {
  Analysis,
  Comment,
  CommentParentType,
  CommunityPost,
  Market,
  MarketCategory,
  NewsItem,
  Profile,
} from "@/lib/types";
import {
  ANALYSES,
  COMMENTS,
  COMMUNITY_POSTS,
  MARKETS,
  NEWS,
  PROFILES,
} from "./seed";

// ---------------------------------------------------------------------------
// Read layer. Every function tries Supabase; if the project isn't configured
// it falls back to the in-memory seed data so the whole UI stays browsable.
// ---------------------------------------------------------------------------

const byNewest = <T extends { created_at?: string; published_at?: string }>(
  a: T,
  b: T,
) => {
  const ad = new Date(a.published_at ?? a.created_at ?? 0).getTime();
  const bd = new Date(b.published_at ?? b.created_at ?? 0).getTime();
  return bd - ad;
};

function profileById(id: string): Profile | undefined {
  return PROFILES.find((p) => p.id === id);
}

// ---- Markets --------------------------------------------------------------

export async function getMarkets(): Promise<Market[]> {
  const sb = await getServerSupabase();
  if (!sb) return MARKETS;
  const { data } = await sb.from("markets").select("*").order("name");
  return data && data.length ? (data as Market[]) : MARKETS;
}

export async function getMarket(slug: string): Promise<Market | null> {
  const all = await getMarkets();
  return all.find((m) => m.slug === slug) ?? null;
}

// ---- News -----------------------------------------------------------------

export async function getNews(opts: {
  market?: MarketCategory;
  limit?: number;
} = {}): Promise<NewsItem[]> {
  const sb = await getServerSupabase();
  if (!sb) {
    let items = [...NEWS].sort(byNewest);
    if (opts.market) items = items.filter((n) => n.market === opts.market);
    if (opts.limit) items = items.slice(0, opts.limit);
    return items;
  }
  let q = sb.from("news").select("*").order("published_at", { ascending: false });
  if (opts.market) q = q.eq("market", opts.market);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as NewsItem[]) ?? [];
}

export async function getPopularNews(limit = 5): Promise<NewsItem[]> {
  const sb = await getServerSupabase();
  if (!sb) return [...NEWS].sort((a, b) => b.views - a.views).slice(0, limit);
  const { data } = await sb
    .from("news")
    .select("*")
    .order("views", { ascending: false })
    .limit(limit);
  return (data as NewsItem[]) ?? [];
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const sb = await getServerSupabase();
  if (!sb) return NEWS.find((n) => n.id === id) ?? null;
  const { data } = await sb.from("news").select("*").eq("id", id).single();
  return (data as NewsItem) ?? null;
}

// ---- Analyses -------------------------------------------------------------

async function attachAnalysisAuthors(rows: Analysis[]): Promise<Analysis[]> {
  return rows.map((a) => ({ ...a, author: a.author ?? profileById(a.author_id) }));
}

export async function getAnalyses(opts: {
  market?: MarketCategory;
  authorId?: string;
  limit?: number;
  sort?: "new" | "popular";
} = {}): Promise<Analysis[]> {
  const sb = await getServerSupabase();
  if (!sb) {
    let items = [...ANALYSES];
    if (opts.market) items = items.filter((a) => a.market === opts.market);
    if (opts.authorId) items = items.filter((a) => a.author_id === opts.authorId);
    items.sort(
      opts.sort === "popular"
        ? (a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0)
        : byNewest,
    );
    if (opts.limit) items = items.slice(0, opts.limit);
    return attachAnalysisAuthors(items);
  }
  let q = sb
    .from("analysis")
    .select("*, author:profiles!analysis_author_id_fkey(*)")
    .order(opts.sort === "popular" ? "likes_count" : "created_at", {
      ascending: false,
    });
  if (opts.market) q = q.eq("market", opts.market);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as Analysis[]) ?? [];
}

export async function getAnalysisById(id: string): Promise<Analysis | null> {
  const sb = await getServerSupabase();
  if (!sb) {
    const a = ANALYSES.find((x) => x.id === id);
    return a ? { ...a, author: profileById(a.author_id) } : null;
  }
  const { data } = await sb
    .from("analysis")
    .select("*, author:profiles!analysis_author_id_fkey(*)")
    .eq("id", id)
    .single();
  return (data as Analysis) ?? null;
}

// ---- Community ------------------------------------------------------------

export async function getCommunityPosts(opts: {
  market?: MarketCategory;
  authorId?: string;
  limit?: number;
  sort?: "new" | "popular";
} = {}): Promise<CommunityPost[]> {
  const sb = await getServerSupabase();
  if (!sb) {
    let items = [...COMMUNITY_POSTS];
    if (opts.market) items = items.filter((p) => p.market === opts.market);
    if (opts.authorId) items = items.filter((p) => p.author_id === opts.authorId);
    items.sort(
      opts.sort === "popular"
        ? (a, b) =>
            (b.likes_count ?? 0) + (b.comments_count ?? 0) -
            ((a.likes_count ?? 0) + (a.comments_count ?? 0))
        : byNewest,
    );
    if (opts.limit) items = items.slice(0, opts.limit);
    return items.map((p) => ({ ...p, author: profileById(p.author_id) }));
  }
  let q = sb
    .from("community_posts")
    .select("*, author:profiles!community_posts_author_id_fkey(*)")
    .order(opts.sort === "popular" ? "likes_count" : "created_at", {
      ascending: false,
    });
  if (opts.market) q = q.eq("market", opts.market);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as CommunityPost[]) ?? [];
}

export async function getCommunityPost(id: string): Promise<CommunityPost | null> {
  const sb = await getServerSupabase();
  if (!sb) {
    const p = COMMUNITY_POSTS.find((x) => x.id === id);
    return p ? { ...p, author: profileById(p.author_id) } : null;
  }
  const { data } = await sb
    .from("community_posts")
    .select("*, author:profiles!community_posts_author_id_fkey(*)")
    .eq("id", id)
    .single();
  return (data as CommunityPost) ?? null;
}

// ---- Comments (threaded) --------------------------------------------------

function threadComments(flat: Comment[]): Comment[] {
  const withAuthors = flat.map((c) => ({
    ...c,
    author: c.author ?? profileById(c.author_id),
    replies: [] as Comment[],
  }));
  const byId = new Map(withAuthors.map((c) => [c.id, c]));
  const roots: Comment[] = [];
  for (const c of withAuthors) {
    if (c.reply_to && byId.has(c.reply_to)) {
      byId.get(c.reply_to)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  }
  const asc = (a: Comment, b: Comment) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  roots.sort(asc);
  roots.forEach((r) => r.replies!.sort(asc));
  return roots;
}

export async function getComments(
  parentType: CommentParentType,
  parentId: string,
): Promise<Comment[]> {
  const sb = await getServerSupabase();
  if (!sb) {
    const flat = COMMENTS.filter(
      (c) => c.parent_type === parentType && c.parent_id === parentId,
    );
    return threadComments(flat);
  }
  const { data } = await sb
    .from("comments")
    .select("*, author:profiles!comments_author_id_fkey(*)")
    .eq("parent_type", parentType)
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });
  return threadComments((data as Comment[]) ?? []);
}

// ---- Profiles -------------------------------------------------------------

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const sb = await getServerSupabase();
  if (!sb) return PROFILES.find((p) => p.username === username) ?? null;
  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return (data as Profile) ?? null;
}

export async function getFollowState(
  profileId: string,
): Promise<{ followers: number; following: number; isFollowing: boolean }> {
  const sb = await getServerSupabase();
  if (!sb) {
    const p = PROFILES.find((x) => x.id === profileId);
    return {
      followers: p?.followers_count ?? 0,
      following: p?.following_count ?? 0,
      isFollowing: false,
    };
  }
  const [{ count: followers }, { count: following }] = await Promise.all([
    sb
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileId),
    sb
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileId),
  ]);
  const {
    data: { user },
  } = await sb.auth.getUser();
  let isFollowing = false;
  if (user) {
    const { data } = await sb
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profileId)
      .maybeSingle();
    isFollowing = !!data;
  }
  return { followers: followers ?? 0, following: following ?? 0, isFollowing };
}

// ---- Feed (from followed users) ------------------------------------------

export async function getFeed(userId: string): Promise<{
  analyses: Analysis[];
  posts: CommunityPost[];
}> {
  const sb = await getServerSupabase();
  if (!sb) {
    // Demo: show everything as if you follow the community.
    const analyses = await getAnalyses({ limit: 10 });
    const posts = await getCommunityPosts({ limit: 10 });
    return { analyses, posts };
  }
  const { data: follows } = await sb
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  const ids = (follows ?? []).map((f) => f.following_id);
  if (!ids.length) return { analyses: [], posts: [] };
  const [{ data: analyses }, { data: posts }] = await Promise.all([
    sb
      .from("analysis")
      .select("*, author:profiles!analysis_author_id_fkey(*)")
      .in("author_id", ids)
      .order("created_at", { ascending: false })
      .limit(20),
    sb
      .from("community_posts")
      .select("*, author:profiles!community_posts_author_id_fkey(*)")
      .in("author_id", ids)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return {
    analyses: (analyses as Analysis[]) ?? [],
    posts: (posts as CommunityPost[]) ?? [],
  };
}

// ---- Search ---------------------------------------------------------------

// ---- Admin helpers --------------------------------------------------------

export async function getAllProfiles(): Promise<Profile[]> {
  const sb = await getServerSupabase();
  if (!sb) return PROFILES;
  const { data } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Profile[]) ?? [];
}

export async function getRecentComments(limit = 30): Promise<Comment[]> {
  const sb = await getServerSupabase();
  if (!sb) {
    return [...COMMENTS]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, limit)
      .map((c) => ({ ...c, author: profileById(c.author_id) }));
  }
  const { data } = await sb
    .from("comments")
    .select("*, author:profiles!comments_author_id_fkey(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Comment[]) ?? [];
}

export interface SearchResults {
  news: NewsItem[];
  analyses: Analysis[];
  posts: CommunityPost[];
  users: Profile[];
}

export async function search(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { news: [], analyses: [], posts: [], users: [] };
  const sb = await getServerSupabase();
  if (!sb) {
    const match = (s: string) => s.toLowerCase().includes(q);
    return {
      news: NEWS.filter((n) => match(n.title) || match(n.summary)),
      analyses: ANALYSES.filter((a) => match(a.title) || match(a.body)).map(
        (a) => ({ ...a, author: profileById(a.author_id) }),
      ),
      posts: COMMUNITY_POSTS.filter((p) => match(p.title) || match(p.body)).map(
        (p) => ({ ...p, author: profileById(p.author_id) }),
      ),
      users: PROFILES.filter(
        (u) => match(u.username) || match(u.display_name) || match(u.bio ?? ""),
      ),
    };
  }
  const like = `%${query}%`;
  const [news, analyses, posts, users] = await Promise.all([
    sb.from("news").select("*").or(`title.ilike.${like},summary.ilike.${like}`).limit(20),
    sb
      .from("analysis")
      .select("*, author:profiles!analysis_author_id_fkey(*)")
      .or(`title.ilike.${like},body.ilike.${like}`)
      .limit(20),
    sb
      .from("community_posts")
      .select("*, author:profiles!community_posts_author_id_fkey(*)")
      .or(`title.ilike.${like},body.ilike.${like}`)
      .limit(20),
    sb
      .from("profiles")
      .select("*")
      .or(`username.ilike.${like},display_name.ilike.${like}`)
      .limit(20),
  ]);
  return {
    news: (news.data as NewsItem[]) ?? [],
    analyses: (analyses.data as Analysis[]) ?? [],
    posts: (posts.data as CommunityPost[]) ?? [],
    users: (users.data as Profile[]) ?? [],
  };
}
