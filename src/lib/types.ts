// Core domain types for Nexonomy Labs.
// These mirror the Supabase table shapes so seed data and DB rows are interchangeable.

export type MarketCategory =
  | "us-stocks"
  | "korea-stocks"
  | "macro"
  | "bonds"
  | "fx"
  | "commodities"
  | "crypto"
  | "general";

export type Sentiment = "bullish" | "bearish" | "neutral";

export interface Market {
  slug: string; // e.g. "us-stocks"
  name: string; // "US Stocks"
  short: string; // "US"
  description: string;
  // A representative index/instrument for the market page header.
  index_symbol: string;
  index_value: number;
  index_change: number; // percent change, e.g. 0.82 or -1.14
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "admin";
  created_at: string;
  // Derived / joined counts (optional in DB, computed in queries)
  followers_count?: number;
  following_count?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  image_url: string | null;
  source: string;
  source_url: string;
  market: MarketCategory;
  published_at: string;
  views: number;
  // joined
  comments_count?: number;
}

export interface Analysis {
  id: string;
  title: string;
  body: string;
  author_id: string;
  market: MarketCategory;
  sentiment: Sentiment;
  related_news_id: string | null;
  created_at: string;
  // joined
  author?: Profile;
  likes_count?: number;
  comments_count?: number;
  liked_by_me?: boolean;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  author_id: string;
  market: MarketCategory;
  created_at: string;
  // joined
  author?: Profile;
  likes_count?: number;
  comments_count?: number;
  liked_by_me?: boolean;
}

export type CommentParentType = "news" | "analysis" | "community";

export interface Comment {
  id: string;
  parent_type: CommentParentType;
  parent_id: string;
  author_id: string;
  body: string;
  reply_to: string | null; // comment id for threaded replies
  created_at: string;
  // joined
  author?: Profile;
  likes_count?: number;
  liked_by_me?: boolean;
  replies?: Comment[];
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const MARKET_LABELS: Record<MarketCategory, string> = {
  "us-stocks": "US Stocks",
  "korea-stocks": "Korea Stocks",
  macro: "Macro",
  bonds: "Bonds",
  fx: "FX",
  commodities: "Commodities",
  crypto: "Crypto",
  general: "General",
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  bullish: "Bullish",
  bearish: "Bearish",
  neutral: "Neutral",
};
