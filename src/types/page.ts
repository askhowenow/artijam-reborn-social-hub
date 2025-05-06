
export interface Page {
  id: string;
  title: string;
  content: string | null;
  slug: string;
  user_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePageInput {
  title: string;
  slug: string;
  content?: string;
  published?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  published?: boolean;
}
