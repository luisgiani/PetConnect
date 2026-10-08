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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
