export type ProfileType = "adotante" | "doador_ong";

export type UserProfile = {
  id: string;
  name: string;
  profileType: ProfileType;
  phone: string | null;
  createdAt: string;
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
