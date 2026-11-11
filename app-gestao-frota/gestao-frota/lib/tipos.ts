/**
 * Tipos TypeScript das tabelas do banco (espelham supabase/schema.sql).
 *
 * O formato é o mesmo gerado por `npx supabase gen types typescript`, então
 * dá para substituir este arquivo pelo gerado automaticamente se quiser.
 *
 * Para adicionar uma tabela: copie o bloco de `configuracoes`, ajuste as
 * colunas em Row/Insert/Update e crie um atalho no fim do arquivo.
 * (Row = como a linha vem do banco; Insert = o que você envia ao criar;
 *  Update = o que você envia ao editar — tudo opcional.)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      configuracoes: {
        Row: {
          id: string;
          unica: boolean;
          nome_negocio: string;
          whatsapp: string | null;
          cidade: string | null;
          endereco: string | null;
          instagram: string | null;
          cor_primaria: string;
          mensagem_whatsapp: string | null;
          // Personalização (tela /personalizacao)
          nome_exibicao: string | null;
          subtitulo: string | null;
          logo_url: string | null;
          cor_destaque: string;
          fonte: string;
          raio: string;
          tema_padrao: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unica?: boolean;
          nome_negocio?: string;
          whatsapp?: string | null;
          cidade?: string | null;
          endereco?: string | null;
          instagram?: string | null;
          cor_primaria?: string;
          mensagem_whatsapp?: string | null;
          nome_exibicao?: string | null;
          subtitulo?: string | null;
          logo_url?: string | null;
          cor_destaque?: string;
          fonte?: string;
          raio?: string;
          tema_padrao?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["configuracoes"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      /** Campos de MARCA para telas sem login (security definer — veja schema.sql). */
      marca_publica: {
        Args: never;
        Returns: {
          nome_exibido: string;
          subtitulo: string | null;
          logo_url: string | null;
          cor_primaria: string;
          cor_destaque: string;
          fonte: string;
          raio: string;
          tema_padrao: string;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type Tabelas = Database["public"]["Tables"];

/** Linha de uma tabela: Linha<"configuracoes"> */
export type Linha<T extends keyof Tabelas> = Tabelas[T]["Row"];
/** Dados para inserir: NovaLinha<"configuracoes"> */
export type NovaLinha<T extends keyof Tabelas> = Tabelas[T]["Insert"];
/** Dados para atualizar: EdicaoLinha<"configuracoes"> */
export type EdicaoLinha<T extends keyof Tabelas> = Tabelas[T]["Update"];

// Atalhos
export type Configuracoes = Linha<"configuracoes">;
