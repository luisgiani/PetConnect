export type ProfileType = "adotante" | "doador_ong";

export type UserProfile = {
  id: string;
  name: string;
  profileType: ProfileType;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  createdAt: string;
};

export type ProfileUpdateInput = {
  name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  profileType: ProfileType;
  phone: string | null;
};

export type SignInInput = {
  email: string;
  password: string;
};
