export interface Armazem {
  cdArmazem: string;
  nome: string;
}

export interface Rua {
  cdArmazem: number;
  cdRua: number;
  nome: string;
}

export interface Prateleira {
  cdPrateleira: number;
  cdRua: number;
  nome: string;
  rua: Rua;
}

export interface Sessao {
  cdPrateleira: number;
  cdSessao: number;
  nome: string;
  prateleira: Prateleira;
}

export interface LeituraHistorico {
  blVazio: boolean;
  cdSessao: number;
  dadoLeitura: string;
  dtRegistro: string;
  id: number;
  idLeitura: string;
  sessao: Sessao;
  tipoDado: string;
}

export enum StatusInventario {
  EM_PROGRESSO = 'em_progresso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

export interface Inventario {
  cdInventario: number;
  cdArmazem: number;
  dtComeco: string;
  dtFim: string | null;
  statusInventario: StatusInventario;
  dtCancelado: string | null;
}
