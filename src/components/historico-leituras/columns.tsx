import { LeituraHistorico } from '@/routes/historico.lazy';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { DataTableColumnHeader } from '../column-header/column-header';

export const columns: ColumnDef<LeituraHistorico>[] = [
  {
    accessorKey: 'sessao.nome',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sessão" />
    ),
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'dtRegistro',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data de Registro" />
    ),
    cell: ({ row }) =>
      dayjs(row.original.dtRegistro).format('DD/MM/YYYY HH:mm:ss'),
  },
  {
    accessorKey: 'tipoDado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Dado" />
    ),
  },
  {
    accessorKey: 'dadoLeitura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dado" />
    ),
  },
  {
    accessorKey: 'blVazio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vazio" />
    ),
    cell: ({ row }) => (row.original.blVazio ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'idLeitura',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID da Leitura" />
    ),
  },
  {
    accessorKey: 'sessao.prateleira.nome',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prateleira" />
    ),
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'sessao.prateleira.rua.nome',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rua" />
    ),
    filterFn: 'equalsString',
  },
];
