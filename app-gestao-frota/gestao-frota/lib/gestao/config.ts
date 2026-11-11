/**
 * CONFIGURAÇÃO DO APP — é aqui que o sistema é "montado": cadastros (campos, selos, filtros), painel inicial,
 * vencimentos e relatórios. Para acrescentar um campo: crie a coluna em supabase/schema.sql e inclua-o na lista
 * `campos` da tabela abaixo. Veja o fim do COMO-ESTENDER.md.
 */
import type { BlocoRelatorio, Entidade, FonteVencimento, Kpi, ListaPainel } from "./tipos";

export const ENTIDADES: Record<string, Entidade> = {
  "motoristas": {
    "tabela": "motoristas",
    "singular": "Motorista",
    "plural": "Motoristas",
    "rota": "motoristas",
    "icone": "UserRound",
    "descricao": "Quem dirige a frota, com a validade da CNH sempre à vista.",
    "vazio": "Cadastre os motoristas para ligar cada um ao seu veículo e acompanhar a validade da CNH.",
    "titulo": "{nome}",
    "subtitulo": "CNH {cnh_categoria}",
    "busca": [
      "nome",
      "telefone"
    ],
    "ordem": [
      [
        "nome",
        "asc"
      ]
    ],
    "visual": "cartoes",
    "quadro": null,
    "wa": {
      "campo": "telefone",
      "msg": "Olá, {titulo}! Aqui é da gestão da frota."
    },
    "filhos": [],
    "campos": [
      {
        "nome": "nome",
        "rotulo": "Nome completo",
        "tipo": "texto",
        "obrig": true,
        "max": 100,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": true,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "telefone",
        "rotulo": "WhatsApp",
        "tipo": "telefone",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "cnh_categoria",
        "rotulo": "Categoria da CNH",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "A",
            "rotulo": "A",
            "tom": "neutro"
          },
          {
            "valor": "B",
            "rotulo": "B",
            "tom": "neutro"
          },
          {
            "valor": "C",
            "rotulo": "C",
            "tom": "neutro"
          },
          {
            "valor": "D",
            "rotulo": "D",
            "tom": "neutro"
          },
          {
            "valor": "E",
            "rotulo": "E",
            "tom": "neutro"
          },
          {
            "valor": "AB",
            "rotulo": "AB",
            "tom": "neutro"
          },
          {
            "valor": "AD",
            "rotulo": "AD",
            "tom": "neutro"
          },
          {
            "valor": "AE",
            "rotulo": "AE",
            "tom": "neutro"
          }
        ],
        "padrao": "B",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "cnh_validade",
        "rotulo": "Validade da CNH",
        "tipo": "data",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "status",
        "rotulo": "Situação",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "ativo",
            "rotulo": "Ativo",
            "tom": "ok"
          },
          {
            "valor": "afastado",
            "rotulo": "Afastado",
            "tom": "alerta"
          },
          {
            "valor": "desligado",
            "rotulo": "Desligado",
            "tom": "neutro"
          }
        ],
        "padrao": "ativo",
        "ref": null,
        "lista": false,
        "destaque": true,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "observacoes",
        "rotulo": "Observações",
        "tipo": "longo",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": false,
    "baixa": null,
    "parcelar": null
  },
  "veiculos": {
    "tabela": "veiculos",
    "singular": "Veículo",
    "plural": "Veículos",
    "rota": "veiculos",
    "icone": "Truck",
    "descricao": "Toda a frota: situação, quilometragem, motorista e documentos.",
    "vazio": "Cadastre o primeiro veículo para começar a controlar abastecimentos, revisões e documentos.",
    "titulo": "{placa} · {modelo}",
    "subtitulo": "{marca} · {ano}",
    "busca": [
      "placa",
      "modelo",
      "marca"
    ],
    "ordem": [
      [
        "placa",
        "asc"
      ]
    ],
    "visual": "cartoes",
    "quadro": null,
    "wa": null,
    "filhos": [
      {
        "tabela": "abastecimentos",
        "campo": "veiculo_id",
        "rotulo": "Abastecimentos"
      },
      {
        "tabela": "manutencoes",
        "campo": "veiculo_id",
        "rotulo": "Manutenções"
      }
    ],
    "campos": [
      {
        "nome": "placa",
        "rotulo": "Placa",
        "tipo": "texto",
        "obrig": true,
        "max": 8,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": "ABC1D23",
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": true,
        "soLeitura": false
      },
      {
        "nome": "modelo",
        "rotulo": "Modelo",
        "tipo": "texto",
        "obrig": true,
        "max": 60,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": "Ex.: Hilux CD SRV",
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "marca",
        "rotulo": "Marca",
        "tipo": "texto",
        "obrig": false,
        "max": 40,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "tipo",
        "rotulo": "Tipo",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "carro",
            "rotulo": "Carro",
            "tom": "neutro"
          },
          {
            "valor": "utilitario",
            "rotulo": "Utilitário",
            "tom": "neutro"
          },
          {
            "valor": "van",
            "rotulo": "Van",
            "tom": "neutro"
          },
          {
            "valor": "caminhao",
            "rotulo": "Caminhão",
            "tom": "neutro"
          },
          {
            "valor": "moto",
            "rotulo": "Moto",
            "tom": "neutro"
          }
        ],
        "padrao": "carro",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "ano",
        "rotulo": "Ano",
        "tipo": "inteiro",
        "obrig": false,
        "max": 120,
        "min": 1980,
        "maxv": 2100,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "combustivel",
        "rotulo": "Combustível",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "flex",
            "rotulo": "Flex",
            "tom": "neutro"
          },
          {
            "valor": "gasolina",
            "rotulo": "Gasolina",
            "tom": "neutro"
          },
          {
            "valor": "etanol",
            "rotulo": "Etanol",
            "tom": "neutro"
          },
          {
            "valor": "diesel",
            "rotulo": "Diesel",
            "tom": "neutro"
          },
          {
            "valor": "gnv",
            "rotulo": "GNV",
            "tom": "neutro"
          },
          {
            "valor": "eletrico",
            "rotulo": "Elétrico",
            "tom": "neutro"
          }
        ],
        "padrao": "flex",
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "odometro",
        "rotulo": "Quilometragem atual",
        "tipo": "inteiro",
        "obrig": true,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": 0,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "motorista_id",
        "rotulo": "Motorista",
        "tipo": "ref",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "motoristas",
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "status",
        "rotulo": "Situação",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "ativo",
            "rotulo": "Em operação",
            "tom": "ok"
          },
          {
            "valor": "manutencao",
            "rotulo": "Em manutenção",
            "tom": "alerta"
          },
          {
            "valor": "reserva",
            "rotulo": "Reserva",
            "tom": "info"
          },
          {
            "valor": "vendido",
            "rotulo": "Vendido",
            "tom": "neutro"
          }
        ],
        "padrao": "ativo",
        "ref": null,
        "lista": false,
        "destaque": true,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "crlv_vencimento",
        "rotulo": "Vencimento do licenciamento (CRLV)",
        "tipo": "data",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "ipva_vencimento",
        "rotulo": "Vencimento do IPVA",
        "tipo": "data",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "seguro_vencimento",
        "rotulo": "Vencimento do seguro",
        "tipo": "data",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "observacoes",
        "rotulo": "Observações",
        "tipo": "longo",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": false,
    "baixa": null,
    "parcelar": null
  },
  "viagens": {
    "tabela": "viagens",
    "singular": "Viagem",
    "plural": "Viagens e rotas",
    "rota": "viagens",
    "icone": "Route",
    "descricao": "Saídas e chegadas da frota: quem levou o veículo, para onde e quantos quilômetros rodou.",
    "vazio": "Registre as saídas para saber quem estava com cada veículo e quanto rodou.",
    "titulo": "{veiculo_id} · {destino}",
    "subtitulo": "{data} · {motorista_id}",
    "busca": [
      "origem",
      "destino",
      "finalidade",
      "veiculo_id",
      "motorista_id"
    ],
    "ordem": [
      [
        "data",
        "desc"
      ]
    ],
    "visual": "tabela",
    "quadro": null,
    "wa": null,
    "filhos": [],
    "campos": [
      {
        "nome": "veiculo_id",
        "rotulo": "Veículo",
        "tipo": "ref",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "veiculos",
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "motorista_id",
        "rotulo": "Motorista",
        "tipo": "ref",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "motoristas",
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "data",
        "rotulo": "Data da saída",
        "tipo": "data",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": "hoje",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "origem",
        "rotulo": "Origem",
        "tipo": "texto",
        "obrig": false,
        "max": 80,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "destino",
        "rotulo": "Destino",
        "tipo": "texto",
        "obrig": true,
        "max": 80,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "finalidade",
        "rotulo": "Finalidade",
        "tipo": "texto",
        "obrig": false,
        "max": 100,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": "Entrega, visita ao cliente, viagem a serviço...",
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "km_saida",
        "rotulo": "Km na saída",
        "tipo": "inteiro",
        "obrig": true,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "km_chegada",
        "rotulo": "Km na chegada",
        "tipo": "inteiro",
        "obrig": false,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": "Preencha quando o veículo voltar.",
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "km_rodados",
        "rotulo": "Km rodados",
        "tipo": "calc",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "inteiro",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "status",
        "rotulo": "Situação",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "andamento",
            "rotulo": "Em andamento",
            "tom": "info"
          },
          {
            "valor": "concluida",
            "rotulo": "Concluída",
            "tom": "ok"
          }
        ],
        "padrao": "andamento",
        "ref": null,
        "lista": false,
        "destaque": true,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": false,
    "baixa": null,
    "parcelar": null
  },
  "abastecimentos": {
    "tabela": "abastecimentos",
    "singular": "Abastecimento",
    "plural": "Abastecimentos",
    "rota": "abastecimentos",
    "icone": "Fuel",
    "descricao": "Cada abastecimento atualiza a quilometragem do veículo e entra nos relatórios de custo.",
    "vazio": "Lance os abastecimentos para saber o consumo e o custo por veículo.",
    "titulo": "{veiculo_id} · {data}",
    "subtitulo": "{posto}",
    "busca": [
      "posto"
    ],
    "ordem": [
      [
        "data",
        "desc"
      ]
    ],
    "visual": "tabela",
    "quadro": null,
    "wa": null,
    "filhos": [],
    "campos": [
      {
        "nome": "veiculo_id",
        "rotulo": "Veículo",
        "tipo": "ref",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "veiculos",
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "data",
        "rotulo": "Data",
        "tipo": "data",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": "hoje",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "motorista_id",
        "rotulo": "Motorista",
        "tipo": "ref",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "motoristas",
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "litros",
        "rotulo": "Litros",
        "tipo": "decimal",
        "obrig": true,
        "max": 120,
        "min": 0.1,
        "maxv": 2000,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " L",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "valor",
        "rotulo": "Valor pago",
        "tipo": "dinheiro",
        "obrig": true,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "preco_litro",
        "rotulo": "R$/litro",
        "tipo": "calc",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 3,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "dinheiro",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "odometro",
        "rotulo": "Quilometragem",
        "tipo": "inteiro",
        "obrig": true,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "posto",
        "rotulo": "Posto",
        "tipo": "texto",
        "obrig": false,
        "max": 80,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": false,
    "baixa": null,
    "parcelar": null
  },
  "manutencoes": {
    "tabela": "manutencoes",
    "singular": "Manutenção",
    "plural": "Manutenções",
    "rota": "manutencoes",
    "icone": "Wrench",
    "descricao": "Revisões, reparos e trocas — agendadas, em andamento e concluídas.",
    "vazio": "Registre as manutenções para nunca esquecer uma revisão.",
    "titulo": "{veiculo_id} · {descricao}",
    "subtitulo": "{oficina}",
    "busca": [
      "descricao",
      "oficina"
    ],
    "ordem": [
      [
        "data_servico",
        "desc"
      ]
    ],
    "visual": "cartoes",
    "quadro": "status",
    "wa": null,
    "filhos": [],
    "campos": [
      {
        "nome": "veiculo_id",
        "rotulo": "Veículo",
        "tipo": "ref",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "veiculos",
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "tipo",
        "rotulo": "Tipo",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "preventiva",
            "rotulo": "Preventiva",
            "tom": "info"
          },
          {
            "valor": "corretiva",
            "rotulo": "Corretiva",
            "tom": "alerta"
          },
          {
            "valor": "revisao",
            "rotulo": "Revisão",
            "tom": "info"
          },
          {
            "valor": "pneus",
            "rotulo": "Pneus",
            "tom": "neutro"
          },
          {
            "valor": "outros",
            "rotulo": "Outros",
            "tom": "neutro"
          }
        ],
        "padrao": "preventiva",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "descricao",
        "rotulo": "O que será feito",
        "tipo": "texto",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": true,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "status",
        "rotulo": "Situação",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "agendada",
            "rotulo": "Agendada",
            "tom": "info"
          },
          {
            "valor": "andamento",
            "rotulo": "Em andamento",
            "tom": "alerta"
          },
          {
            "valor": "concluida",
            "rotulo": "Concluída",
            "tom": "ok"
          }
        ],
        "padrao": "agendada",
        "ref": null,
        "lista": false,
        "destaque": true,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "data_servico",
        "rotulo": "Data do serviço",
        "tipo": "data",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": "hoje",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "oficina",
        "rotulo": "Oficina",
        "tipo": "texto",
        "obrig": false,
        "max": 80,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "valor",
        "rotulo": "Valor",
        "tipo": "dinheiro",
        "obrig": false,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "odometro",
        "rotulo": "Quilometragem",
        "tipo": "inteiro",
        "obrig": false,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "proxima_data",
        "rotulo": "Próxima revisão (data)",
        "tipo": "data",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": "Aparece na tela Vencimentos.",
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "proximo_km",
        "rotulo": "Próxima revisão (km)",
        "tipo": "inteiro",
        "obrig": false,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": " km",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": true,
    "baixa": null,
    "parcelar": null
  },
  "despesas": {
    "tabela": "despesas",
    "singular": "Despesa",
    "plural": "Despesas da frota",
    "rota": "despesas",
    "icone": "Wallet",
    "descricao": "IPVA, seguro, pedágio, lavagem, estacionamento e outras contas: a pagar, parceladas ou já pagas.",
    "vazio": "Lance as despesas da frota que não são combustível nem manutenção.",
    "titulo": "{descricao}",
    "subtitulo": "{categoria} · {veiculo_id}",
    "busca": [
      "descricao",
      "fornecedor",
      "veiculo_id"
    ],
    "ordem": [
      [
        "vencimento",
        "desc"
      ]
    ],
    "visual": "tabela",
    "quadro": null,
    "wa": null,
    "filhos": [],
    "campos": [
      {
        "nome": "descricao",
        "rotulo": "Descrição",
        "tipo": "texto",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": "IPVA 2026, seguro anual, pedágios do mês...",
        "cheia": true,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "categoria",
        "rotulo": "Categoria",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "ipva",
            "rotulo": "IPVA e licenciamento",
            "tom": "neutro"
          },
          {
            "valor": "seguro",
            "rotulo": "Seguro",
            "tom": "neutro"
          },
          {
            "valor": "pedagio",
            "rotulo": "Pedágio",
            "tom": "neutro"
          },
          {
            "valor": "estacionamento",
            "rotulo": "Estacionamento",
            "tom": "neutro"
          },
          {
            "valor": "lavagem",
            "rotulo": "Lavagem",
            "tom": "neutro"
          },
          {
            "valor": "rastreador",
            "rotulo": "Rastreador",
            "tom": "neutro"
          },
          {
            "valor": "outros",
            "rotulo": "Outras",
            "tom": "neutro"
          }
        ],
        "padrao": "outros",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "veiculo_id",
        "rotulo": "Veículo",
        "tipo": "ref",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "veiculos",
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "valor",
        "rotulo": "Valor",
        "tipo": "dinheiro",
        "obrig": true,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "vencimento",
        "rotulo": "Vencimento",
        "tipo": "data",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": "hoje",
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": "Aparece na tela Vencimentos enquanto estiver a pagar.",
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "status",
        "rotulo": "Situação",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "a_pagar",
            "rotulo": "A pagar",
            "tom": "alerta"
          },
          {
            "valor": "paga",
            "rotulo": "Paga",
            "tom": "ok"
          }
        ],
        "padrao": "a_pagar",
        "ref": null,
        "lista": false,
        "destaque": true,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "pago_em",
        "rotulo": "Pago em",
        "tipo": "data",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "fornecedor",
        "rotulo": "Fornecedor",
        "tipo": "texto",
        "obrig": false,
        "max": 80,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": true,
    "baixa": {
      "campo": "status",
      "pago": "paga",
      "data": "pago_em",
      "aberto": "a_pagar",
      "rotulo": null
    },
    "parcelar": {
      "valor": "valor",
      "data": "vencimento",
      "texto": "descricao"
    }
  },
  "multas": {
    "tabela": "multas",
    "singular": "Multa",
    "plural": "Multas",
    "rota": "multas",
    "icone": "TriangleAlert",
    "descricao": "Infrações por veículo e motorista, com o vencimento para não pagar em atraso.",
    "vazio": "Nenhuma multa registrada. Que bom!",
    "titulo": "{veiculo_id} · {infracao}",
    "subtitulo": "{data}",
    "busca": [
      "infracao"
    ],
    "ordem": [
      [
        "vencimento",
        "asc"
      ]
    ],
    "visual": "cartoes",
    "quadro": null,
    "wa": null,
    "filhos": [],
    "campos": [
      {
        "nome": "veiculo_id",
        "rotulo": "Veículo",
        "tipo": "ref",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "veiculos",
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "motorista_id",
        "rotulo": "Motorista",
        "tipo": "ref",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": "motoristas",
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "data",
        "rotulo": "Data da infração",
        "tipo": "data",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": "hoje",
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "infracao",
        "rotulo": "Infração",
        "tipo": "texto",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": false,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": true,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "pontos",
        "rotulo": "Pontos na CNH",
        "tipo": "inteiro",
        "obrig": false,
        "max": 120,
        "min": 0,
        "maxv": 21,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "valor",
        "rotulo": "Valor",
        "tipo": "dinheiro",
        "obrig": true,
        "max": 120,
        "min": 0,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "vencimento",
        "rotulo": "Vencimento",
        "tipo": "data",
        "obrig": false,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [],
        "padrao": null,
        "ref": null,
        "lista": true,
        "destaque": false,
        "filtro": false,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      },
      {
        "nome": "status",
        "rotulo": "Situação",
        "tipo": "select",
        "obrig": true,
        "max": 120,
        "min": null,
        "maxv": null,
        "casas": 2,
        "opcoes": [
          {
            "valor": "a_pagar",
            "rotulo": "A pagar",
            "tom": "alerta"
          },
          {
            "valor": "paga",
            "rotulo": "Paga",
            "tom": "ok"
          },
          {
            "valor": "recorrida",
            "rotulo": "Recorrida",
            "tom": "info"
          }
        ],
        "padrao": "a_pagar",
        "ref": null,
        "lista": false,
        "destaque": true,
        "filtro": true,
        "ajuda": null,
        "placeholder": null,
        "cheia": false,
        "sufixo": "",
        "exibir": "numero",
        "maiusculas": false,
        "soLeitura": false
      }
    ],
    "semForm": false,
    "feminino": true,
    "baixa": {
      "campo": "status",
      "pago": "paga",
      "data": null,
      "aberto": "a_pagar",
      "rotulo": null
    },
    "parcelar": null
  }
};

export const PAINEL: { kpis: Kpi[]; listas: ListaPainel[]; atalhos: { rotulo: string; tabela: string }[] } = {
  kpis: [
  {
    "rotulo": "Veículos em operação",
    "tabela": "veiculos",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "status",
        "eq",
        "ativo"
      ]
    ],
    "formato": "numero",
    "icone": "Truck",
    "tom": "marca",
    "link": "/veiculos",
    "dica": null
  },
  {
    "rotulo": "Em manutenção",
    "tabela": "veiculos",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "status",
        "eq",
        "manutencao"
      ]
    ],
    "formato": "numero",
    "icone": "Wrench",
    "tom": "alerta",
    "link": "/manutencoes",
    "dica": null
  },
  {
    "rotulo": "Combustível no mês",
    "tabela": "abastecimentos",
    "op": "sum",
    "campo": "valor",
    "onde": [
      [
        "data",
        "gte",
        [
          "mes_ini"
        ]
      ]
    ],
    "formato": "moeda",
    "icone": "Fuel",
    "tom": "info",
    "link": "/abastecimentos",
    "dica": null
  },
  {
    "rotulo": "Manutenção no mês",
    "tabela": "manutencoes",
    "op": "sum",
    "campo": "valor",
    "onde": [
      [
        "data_servico",
        "gte",
        [
          "mes_ini"
        ]
      ],
      [
        "status",
        "neq",
        "agendada"
      ]
    ],
    "formato": "moeda",
    "icone": "Receipt",
    "tom": "info",
    "link": "/manutencoes",
    "dica": null
  },
  {
    "rotulo": "Licenciamento vencido",
    "tabela": "veiculos",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "crlv_vencimento",
        "lt",
        [
          "hoje",
          0
        ]
      ],
      [
        "status",
        "neq",
        "vendido"
      ]
    ],
    "formato": "numero",
    "icone": "FileWarning",
    "tom": "perigo",
    "link": "/vencimentos",
    "dica": null
  },
  {
    "rotulo": "CNH vencendo (30 dias)",
    "tabela": "motoristas",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "cnh_validade",
        "gte",
        [
          "hoje",
          0
        ]
      ],
      [
        "cnh_validade",
        "lte",
        [
          "hoje",
          30
        ]
      ],
      [
        "status",
        "eq",
        "ativo"
      ]
    ],
    "formato": "numero",
    "icone": "IdCard",
    "tom": "alerta",
    "link": "/vencimentos",
    "dica": null
  },
  {
    "rotulo": "Km rodados no mês",
    "tabela": "viagens",
    "op": "sum",
    "campo": "km_rodados",
    "onde": [
      [
        "data",
        "gte",
        [
          "mes_ini"
        ]
      ]
    ],
    "formato": "numero",
    "icone": "Route",
    "tom": "info",
    "link": "/viagens",
    "dica": null
  },
  {
    "rotulo": "Viagens em andamento",
    "tabela": "viagens",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "status",
        "eq",
        "andamento"
      ]
    ],
    "formato": "numero",
    "icone": "Route",
    "tom": "ok",
    "link": "/viagens",
    "dica": null
  },
  {
    "rotulo": "Despesas a pagar",
    "tabela": "despesas",
    "op": "sum",
    "campo": "valor",
    "onde": [
      [
        "status",
        "eq",
        "a_pagar"
      ]
    ],
    "formato": "moeda",
    "icone": "Wallet",
    "tom": "alerta",
    "link": "/despesas",
    "dica": null
  },
  {
    "rotulo": "Multas a pagar",
    "tabela": "multas",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "status",
        "eq",
        "a_pagar"
      ]
    ],
    "formato": "numero",
    "icone": "TriangleAlert",
    "tom": "perigo",
    "link": "/multas",
    "dica": null
  },
  {
    "rotulo": "Motoristas ativos",
    "tabela": "motoristas",
    "op": "count",
    "campo": null,
    "onde": [
      [
        "status",
        "eq",
        "ativo"
      ]
    ],
    "formato": "numero",
    "icone": "UserRound",
    "tom": "ok",
    "link": "/motoristas",
    "dica": null
  }
],
  listas: [
  {
    "titulo": "Próximas manutenções",
    "tabela": "manutencoes",
    "onde": [
      [
        "status",
        "in",
        [
          "agendada",
          "andamento"
        ]
      ]
    ],
    "ordem": [
      "data_servico",
      "asc"
    ],
    "limite": 6,
    "meta": [
      "status",
      "data_servico"
    ],
    "vazio": "Nenhuma manutenção agendada.",
    "link": "/manutencoes",
    "icone": "Wrench"
  },
  {
    "titulo": "Últimos abastecimentos",
    "tabela": "abastecimentos",
    "onde": [],
    "ordem": [
      "data",
      "desc"
    ],
    "limite": 6,
    "meta": [
      "litros",
      "valor"
    ],
    "vazio": "Nada por aqui.",
    "link": "/abastecimentos",
    "icone": "Fuel"
  },
  {
    "titulo": "Multas em aberto",
    "tabela": "multas",
    "onde": [
      [
        "status",
        "eq",
        "a_pagar"
      ]
    ],
    "ordem": [
      "vencimento",
      "asc"
    ],
    "limite": 6,
    "meta": [
      "valor",
      "vencimento"
    ],
    "vazio": "Nenhuma multa em aberto.",
    "link": "/multas",
    "icone": "TriangleAlert"
  }
],
  atalhos: [
  {
    "rotulo": "Registrar viagem",
    "tabela": "viagens"
  },
  {
    "rotulo": "Novo abastecimento",
    "tabela": "abastecimentos"
  },
  {
    "rotulo": "Nova manutenção",
    "tabela": "manutencoes"
  },
  {
    "rotulo": "Novo veículo",
    "tabela": "veiculos"
  },
  {
    "rotulo": "Registrar multa",
    "tabela": "multas"
  }
],
};

export const VENCIMENTOS: FonteVencimento[] = [
  {
    "tabela": "veiculos",
    "campo": "crlv_vencimento",
    "tipo": "Licenciamento (CRLV)",
    "onde": [
      [
        "status",
        "neq",
        "vendido"
      ]
    ],
    "detalhe": "motorista_id",
    "janela": 90
  },
  {
    "tabela": "veiculos",
    "campo": "ipva_vencimento",
    "tipo": "IPVA",
    "onde": [
      [
        "status",
        "neq",
        "vendido"
      ]
    ],
    "detalhe": null,
    "janela": 90
  },
  {
    "tabela": "veiculos",
    "campo": "seguro_vencimento",
    "tipo": "Seguro",
    "onde": [
      [
        "status",
        "neq",
        "vendido"
      ]
    ],
    "detalhe": null,
    "janela": 90
  },
  {
    "tabela": "motoristas",
    "campo": "cnh_validade",
    "tipo": "CNH",
    "onde": [
      [
        "status",
        "neq",
        "desligado"
      ]
    ],
    "detalhe": null,
    "janela": 90
  },
  {
    "tabela": "manutencoes",
    "campo": "proxima_data",
    "tipo": "Próxima revisão",
    "onde": [
      [
        "status",
        "eq",
        "concluida"
      ]
    ],
    "detalhe": "veiculo_id",
    "janela": 90
  },
  {
    "tabela": "multas",
    "campo": "vencimento",
    "tipo": "Multa a pagar",
    "onde": [
      [
        "status",
        "eq",
        "a_pagar"
      ]
    ],
    "detalhe": "valor",
    "janela": 90
  },
  {
    "tabela": "despesas",
    "campo": "vencimento",
    "tipo": "Despesa a pagar",
    "onde": [
      [
        "status",
        "eq",
        "a_pagar"
      ]
    ],
    "detalhe": "valor",
    "janela": 90
  }
];

export const RELATORIOS: BlocoRelatorio[] = [
  {
    "tipo": "mensal",
    "titulo": "Gasto com combustível por mês",
    "tabela": "abastecimentos",
    "campoData": "data",
    "valor": "valor",
    "agrupar": null,
    "onde": [],
    "formato": "moeda",
    "meses": 6,
    "dica": null
  },
  {
    "tipo": "mensal",
    "titulo": "Km rodados por mês",
    "tabela": "viagens",
    "campoData": "data",
    "valor": "km_rodados",
    "agrupar": null,
    "onde": [],
    "formato": "numero",
    "meses": 6,
    "dica": null
  },
  {
    "tipo": "categoria",
    "titulo": "Despesas da frota por categoria (12 meses)",
    "tabela": "despesas",
    "campoData": null,
    "valor": "valor",
    "agrupar": "categoria",
    "onde": [
      [
        "vencimento",
        "gte",
        [
          "hoje",
          -365
        ]
      ]
    ],
    "formato": "moeda",
    "meses": 6,
    "dica": null
  },
  {
    "tipo": "mensal",
    "titulo": "Gasto com manutenção por mês",
    "tabela": "manutencoes",
    "campoData": "data_servico",
    "valor": "valor",
    "agrupar": null,
    "onde": [
      [
        "status",
        "neq",
        "agendada"
      ]
    ],
    "formato": "moeda",
    "meses": 6,
    "dica": null
  },
  {
    "tipo": "categoria",
    "titulo": "Combustível por veículo (90 dias)",
    "tabela": "abastecimentos",
    "campoData": null,
    "valor": "valor",
    "agrupar": "veiculo_id",
    "onde": [
      [
        "data",
        "gte",
        [
          "hoje",
          -90
        ]
      ]
    ],
    "formato": "moeda",
    "meses": 6,
    "dica": null
  },
  {
    "tipo": "categoria",
    "titulo": "Manutenção por tipo (12 meses)",
    "tabela": "manutencoes",
    "campoData": null,
    "valor": "valor",
    "agrupar": "tipo",
    "onde": [
      [
        "data_servico",
        "gte",
        [
          "hoje",
          -365
        ]
      ],
      [
        "status",
        "neq",
        "agendada"
      ]
    ],
    "formato": "moeda",
    "meses": 6,
    "dica": null
  }
];
