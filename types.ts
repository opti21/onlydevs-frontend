export type Member = {
  id: number;
  username?: string;
};

export type TwitchUser = {
  id: string;
  login: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  view_count: number;
  created_at: string;
  is_live: boolean;
};

export type TeamDataResponse = TwitchUser[];
