import {
  CurrentPosition,
  LayoutVisualizer,
  RuaLayout,
} from '@/components/layout-visualizer/layout-visualizer.component';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Armazem, Inventario, StatusInventario } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export interface Reading {
  type: string;
  data: string;
  timestamp: string;
}

export interface SavedReading {
  tipoDado: string;
  dadoLeitura: string;
  dtRegistro: string;
  blVazio: boolean;
}

export interface AllSavedReadings {
  [key: string]: SavedReading[];
}

interface FormData {
  nomeRua: string;
  nomePrateleira: string;
  nomeSessao: string;
}

export const Route = createLazyFileRoute('/')({
  component: SequentialStream,
});

function SequentialStream() {
  const cdCliente = localStorage.getItem('cdCliente') || '33';
  const [cdArmazem, setCdArmazem] = useState('');
  const [formData, setFormData] = useState<FormData>({
    nomeRua: '',
    nomePrateleira: '',
    nomeSessao: '',
  });
  const [currentReadings, setCurrentReadings] = useState<Set<string>>(
    new Set(),
  );
  const [readingsList, setReadingsList] = useState<Reading[]>([]);
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [ruas, setRuas] = useState<RuaLayout[]>([]);
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition>({
    address: '01-001-010',
    vertical_direction: 'up',
    z_direction: 'forward',
  });

  const [allReadings, setAllReadings] = useState<AllSavedReadings>({});

  const { data: armazens } = useQuery({
    queryKey: ['armazens', cdCliente],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/cliente/${cdCliente}/armazem`).then(
        (res) => res.json() as Promise<{ armazens: Armazem[] }>,
      );
      if (cdArmazem === '') {
        setCdArmazem(res.armazens[0].cdArmazem);
      }
      return res.armazens;
    },
  });

  const { data: inventarios } = useQuery({
    queryKey: ['inventarios', cdCliente],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/cliente/${cdCliente}/inventario?statusInventario=${StatusInventario.EM_PROGRESSO}`,
      ).then((res) => res.json() as Promise<{ inventario: Inventario[] }>);
      return res.inventario;
    },
  });

  useEffect(() => {
    fetch(`${API_URL}/get_layout`)
      .then((response) => response.json())
      .then((data) => {
        setRuas(data.armazem[0].rua);
        console.log(data);
      })
      .catch((error) => console.error('Error fetching layout:', error));
  }, []);

  const addReadingField = useCallback(
    (reading: Reading) => {
      const readingKey = `${reading.type}-${reading.data}`;
      if (!currentReadings.has(readingKey)) {
        setCurrentReadings((prev) => new Set(prev).add(readingKey));
        setReadingsList((prev) => [...prev, reading]);
      }
    },
    [currentReadings],
  );

  const updateLatestCode = useCallback(async () => {
    if (!isScanning) return;

    try {
      const response = await fetch(`${API_URL}/latest_code`);
      const data = await response.json();

      if (data.data) {
        const reading = {
          type: data.type,
          data: data.data,
          timestamp: data.timestamp,
        };
        setLatestReading(reading);
        addReadingField(reading);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [isScanning, addReadingField]);

  useEffect(() => {
    const interval = setInterval(updateLatestCode, 1000);
    return () => clearInterval(interval);
  }, [updateLatestCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitFormAsync = async (isEmpty: boolean) => {
    const payload = {
      nomeRua: formData.nomeRua,
      nomePrateleira: formData.nomePrateleira,
      nomeSessao: formData.nomeSessao,
      isEmpty,
      readings: isEmpty
        ? []
        : readingsList.map((reading) => ({
            type: reading.type,
            data: reading.data,
            timestamp: reading.timestamp,
          })),
    };

    const response = await fetch(`${API_URL}/save_readings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setAllReadings(data.current_readings);

    console.log(allReadings);

    return data;
  };

  const saveAndNext = async (isEmpty = false) => {
    setIsScanning(false);
    setIsSubmitting(true);

    try {
      await submitFormAsync(isEmpty);

      const currentAddress = `${formData.nomeRua}-${formData.nomePrateleira}-${formData.nomeSessao}`;
      const searchParams = new URLSearchParams({ address: currentAddress });

      const response = await fetch(
        `${API_URL}/get_next_address?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (data && !data.is_last_address) {
        const [rua, prat, sessao] = data.address.split('-');
        setFormData({
          nomeRua: rua,
          nomePrateleira: prat,
          nomeSessao: sessao,
        });
        setCurrentReadings(new Set());
        setReadingsList([]);
        setLatestReading(null);

        setCurrentPosition({
          address: data.address,
          vertical_direction: data.vertical_direction,
          z_direction: data.z_direction,
        });
      } else if (data && data.is_last_address) {
        alert('Não há mais endereços disponíveis');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao processar a requisição');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleScanning = () => {
    setIsScanning((prev) => !prev);
  };

  return (
    <div>
      <div className="flex gap-4 p-4">
        <Button variant="outline">Nova Leitura</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={(inventarios || [])?.length === 0}
            >
              Continuar Leitura...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {inventarios?.map((inventario) => (
              <DropdownMenuItem key={inventario.cdInventario}>
                {inventario.dtComeco}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          <Label>Armazém</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um armazém" />
            </SelectTrigger>
            <SelectContent>
              {armazens?.map((armazem) => (
                <SelectItem key={armazem.cdArmazem} value={armazem.cdArmazem}>
                  {armazem.nome ?? armazem.cdArmazem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="container mx-auto p-4 flex gap-4">
        <div className="flex-1">
          <div className="relative min-h-[300px] rounded-lg overflow-hidden">
            <div
              className={`absolute inset-0 pointer-events-none border-8 transition-colors z-10 
              ${isScanning ? 'border-green-500' : 'border-gray-500'}`}
            >
              <div
                className={`absolute top-2 right-2 px-3 py-1 rounded font-bold text-white
                ${isScanning ? 'bg-green-500' : 'bg-gray-500'}`}
              >
                {isScanning
                  ? 'Escaneando...'
                  : 'Pausado. Mova a câmera para o próximo endereço'}
              </div>
            </div>

            {isStreamLoading && !streamError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4 mx-auto"></div>
                  <p className="text-gray-700">Carregando stream...</p>
                </div>
              </div>
            )}

            {streamError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                <div className="text-center text-red-500">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p>Erro ao carregar stream</p>
                  <button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            <img
              src={`${API_URL}/video_feed`}
              alt="Video Feed"
              className="w-full max-w-[1280px] h-auto z-0"
              style={{
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
              }}
              onLoad={() => setIsStreamLoading(false)}
              onError={() => {
                setStreamError(true);
                setIsStreamLoading(false);
              }}
            />
          </div>
        </div>

        <div className="w-96">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rua:
                  </label>
                  <input
                    type="text"
                    name="nomeRua"
                    value={formData.nomeRua}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prateleira:
                  </label>
                  <input
                    type="text"
                    name="nomePrateleira"
                    value={formData.nomePrateleira}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sessao:
                  </label>
                  <input
                    type="text"
                    name="nomeSessao"
                    value={formData.nomeSessao}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-500 shadow-sm bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  {readingsList.map((reading, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <h3 className="font-medium">Valor {index + 1}</h3>
                      <p>
                        <strong>Type:</strong> {reading.type}
                      </p>
                      <p>
                        <strong>Data:</strong> {reading.data}
                      </p>
                      <p>
                        <strong>Time:</strong> {reading.timestamp}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => saveAndNext(true)}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                  >
                    Salvar como Vazio e Próximo
                  </button>
                  <button
                    type="button"
                    onClick={() => saveAndNext(false)}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    Salvar e Próximo
                  </button>
                  <button
                    type="button"
                    onClick={toggleScanning}
                    className={`w-full py-2 text-white rounded-md ${isScanning ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {isScanning ? '⏸️ Pausar Scan' : '▶️ Começar Scan'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Última leitura</h2>
            {latestReading ? (
              <div className="p-3 bg-gray-50 rounded-md">
                <p>
                  <strong>Tipo:</strong> {latestReading.type}
                </p>
                <p>
                  <strong>Dado:</strong> {latestReading.data}
                </p>
                <p>
                  <strong>Tempo:</strong> {latestReading.timestamp}
                </p>
              </div>
            ) : (
              <p>Aguardando leituras...</p>
            )}
          </div>
        </div>
      </div>
      {ruas?.length > 0 && (
        <LayoutVisualizer
          ruas={ruas}
          currentPosition={currentPosition}
          allReadings={allReadings}
          onCurrentPositionChange={setCurrentPosition}
        />
      )}
    </div>
  );
}
