import { columns } from '@/components/historico-leituras/columns';
import { DataTable } from '@/components/historico-leituras/data-table';
import {
  ArmazemLayout,
  LayoutVisualizer,
} from '@/components/layout-visualizer/layout-visualizer.component';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { AllSavedReadings } from './index.lazy';
import { ColumnFiltersState } from '@tanstack/react-table';

export const Route = createLazyFileRoute('/historico')({
  component: Historico,
});

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

function Historico() {
  const cdCliente = localStorage.getItem('cdCliente') || '33';

  const [cdArmazem, setCdArmazem] = useState('');
  const [dataLeitura, setDataLeitura] = useState<Date>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data: armazens, isLoading: isLoadingArmazens } = useQuery({
    queryKey: ['armazens', cdCliente],
    queryFn: async () => {
      const res = await fetch(
        `http://127.0.0.1:5000/cliente/${cdCliente}/armazem`,
      ).then((res) => res.json() as Promise<{ armazens: Armazem[] }>);
      if (cdArmazem === '') {
        setCdArmazem(res.armazens[0].cdArmazem);
      }
      return res.armazens;
    },
  });

  useQuery({
    queryKey: ['leituras', cdCliente, cdArmazem],
    queryFn: async () => {
      const res = await fetch(
        `http://127.0.0.1:5000/cliente/${cdCliente}/armazem/${cdArmazem}/datas-leitura`,
      ).then((res) => res.json() as Promise<{ datas_leitura: string[] }>);

      if (res.datas_leitura.length) {
        setDataLeitura(dayjs(res.datas_leitura[0]).toDate());
      }
      return res.datas_leitura;
    },
    enabled: !!cdArmazem,
  });

  const { data: dataHistorico } = useQuery({
    queryKey: ['historico', cdCliente, cdArmazem, dataLeitura],
    queryFn: async () => {
      const url = new URL(`http://127.0.0.1:5000/historico`);
      url.searchParams.set('cdArmazem', cdArmazem);
      url.searchParams.set(
        'dataLeitura',
        dayjs(dataLeitura).format('YYYYMMDD'),
      );
      const res = await fetch(url.toString()).then(
        (res) => res.json() as Promise<{ leituras: LeituraHistorico[] }>,
      );

      return res?.leituras || [];
    },
    enabled: !!cdArmazem && !!dataLeitura,
  });

  const { data: dataRuas } = useQuery({
    queryKey: ['layout', cdCliente, cdArmazem],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:5000/get_layout`).then(
        (res) => res.json() as Promise<{ armazem: ArmazemLayout[] }>,
      );
      return res?.armazem?.[0]?.rua || [];
    },
    enabled: !!cdArmazem,
  });

  const { data: dataDatasLeitura } = useQuery({
    queryKey: ['datas-leitura', cdCliente, cdArmazem],
    queryFn: async () => {
      const res = await fetch(
        `http://127.0.0.1:5000/cliente/${cdCliente}/armazem/${cdArmazem}/datas-leitura`,
      ).then((res) => res.json() as Promise<{ datas_leitura: string[] }>);
      return res?.datas_leitura || [];
    },
    enabled: !!cdArmazem,
  });

  const datasLeitura = dataDatasLeitura?.map((data) => dayjs(data).toDate());

  const allReadings: AllSavedReadings = (dataHistorico || []).reduce(
    (acc: AllSavedReadings, leitura) => {
      acc[leitura.sessao.nome] = acc[leitura.sessao.nome] || [];
      acc[leitura.sessao.nome].push({
        tipoDado: leitura.tipoDado,
        dadoLeitura: leitura.dadoLeitura,
        dtRegistro: leitura.dtRegistro,
        blVazio: leitura.blVazio,
      });
      return acc;
    },
    {},
  );

  const onPrateleiraClick = (nomePrateleira: string) => {
    if (
      columnFilters.find(
        (filter) =>
          filter.id === 'sessao_prateleira_nome' &&
          filter.value === nomePrateleira,
      )
    ) {
      setColumnFilters((prev) =>
        prev.filter((item) => item.id !== 'sessao_prateleira_nome'),
      );
    } else {
      setColumnFilters([
        ...columnFilters.filter(
          (item) =>
            item.id !== 'sessao_prateleira_rua_nome' &&
            item.id !== 'sessao_prateleira_nome' &&
            item.id !== 'sessao_nome',
        ),
        {
          id: 'sessao_prateleira_nome',
          value: nomePrateleira,
        },
      ]);
    }
  };

  const onRuaClick = (nomeRua: string) => {
    if (
      columnFilters.find(
        (filter) =>
          filter.id === 'sessao_prateleira_rua_nome' &&
          filter.value === nomeRua,
      )
    ) {
      setColumnFilters((prev) =>
        prev.filter((item) => item.id !== 'sessao_prateleira_rua_nome'),
      );
    } else {
      setColumnFilters([
        ...columnFilters.filter(
          (item) =>
            item.id !== 'sessao_prateleira_rua_nome' &&
            item.id !== 'sessao_prateleira_nome' &&
            item.id !== 'sessao_nome',
        ),
        {
          id: 'sessao_prateleira_rua_nome',
          value: nomeRua,
        },
      ]);
    }
  };

  const onSessaoClick = (nomeSessao: string) => {
    if (
      columnFilters.find(
        (filter) => filter.id === 'sessao_nome' && filter.value === nomeSessao,
      )
    ) {
      setColumnFilters((prev) =>
        prev.filter((item) => item.id !== 'sessao_nome'),
      );
    } else {
      setColumnFilters([
        ...columnFilters.filter(
          (item) =>
            item.id !== 'sessao_prateleira_rua_nome' &&
            item.id !== 'sessao_prateleira_nome' &&
            item.id !== 'sessao_nome',
        ),
        {
          id: 'sessao_nome',
          value: nomeSessao,
        },
      ]);
    }
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-8">Histórico</h1>

      <div className="flex flex-col gap-4">
        {!isLoadingArmazens && armazens && armazens.length > 1 && (
          <Select value={cdArmazem} onValueChange={setCdArmazem}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o armazém" />
            </SelectTrigger>
            <SelectContent>
              {armazens?.map((armazem) => (
                <SelectItem key={armazem.cdArmazem} value={armazem.cdArmazem}>
                  {armazem.nome
                    ? `${armazem.cdArmazem} - ${armazem.nome}`
                    : armazem.cdArmazem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !dataLeitura && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataLeitura ? (
                dayjs(dataLeitura).format('DD/MM/YYYY')
              ) : (
                <span>Escolha a data da leitura</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dataLeitura}
              onSelect={setDataLeitura}
              initialFocus
              datesWithData={datasLeitura}
            />
          </PopoverContent>
        </Popover>

        <DataTable
          columns={columns}
          data={dataHistorico || []}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
        />

        {dataRuas && (
          <LayoutVisualizer
            ruas={dataRuas}
            allReadings={allReadings}
            onPrateleiraClick={onPrateleiraClick}
            onRuaClick={onRuaClick}
            onSessaoClick={onSessaoClick}
            isSelectable={true}
          />
        )}
      </div>
    </div>
  );
}
