import type { AnimalHealth, AnimalSize, AnimalSpecies, AnimalStatus } from "@/features/animals/types";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          profile_type: "adotante" | "doador_ong";
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          profile_type: "adotante" | "doador_ong";
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      animals: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: AnimalSpecies;
          breed: string | null;
          city: string | null;
          state: string | null;
          photo_paths: string[];
          age_months: number;
          size: AnimalSize;
          health_status: AnimalHealth;
          description: string;
          status: AnimalStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species: AnimalSpecies;
          breed?: string | null;
          city?: string | null;
          state?: string | null;
          photo_paths?: string[];
          age_months: number;
          size: AnimalSize;
          health_status: AnimalHealth;
          description: string;
          status?: AnimalStatus;
          created_at?: string;
        };
        Update: {
          name?: string;
          species?: AnimalSpecies;
          breed?: string | null;
          city?: string | null;
          state?: string | null;
          photo_paths?: string[];
          age_months?: number;
          size?: AnimalSize;
          health_status?: AnimalHealth;
          description?: string;
          status?: AnimalStatus;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_animal_contacts: {
        Args: { p_animal_ids: string[] };
        Returns: {
          animal_id: string;
          donor_name: string;
          donor_phone: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
