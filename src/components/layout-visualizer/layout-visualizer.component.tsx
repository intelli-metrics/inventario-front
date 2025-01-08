import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { AllSavedReadings, SavedReading } from '@/routes/index.lazy';
import { QrCodeIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface SessaoLayout {
  nome: string;
  position: number;
}

export interface PrateleiraLayout {
  nome: string;
  position: number;
  sessao: SessaoLayout[];
}

export interface RuaLayout {
  nome: string;
  position: number;
  prateleira: PrateleiraLayout[];
}

export interface ArmazemLayout {
  nome: string;
  rua: RuaLayout[];
}

export interface CurrentPosition {
  address: string;
  vertical_direction?: 'up' | 'down';
  z_direction?: 'forward' | 'backward';
}

export interface LayoutVisualizerProps {
  ruas: RuaLayout[];
  currentPosition?: CurrentPosition;
  allReadings?: AllSavedReadings;
  onRuaClick?: (nomeRua: string) => void;
  onPrateleiraClick?: (nomePrateleira: string) => void;
  onSessaoClick?: (nomeSessao: string) => void;
  isSelectable?: boolean;
  onCurrentPositionChange?: (currentPosition: CurrentPosition) => void;
}

export function LayoutVisualizer({
  ruas,
  currentPosition,
  allReadings,
  onRuaClick,
  onPrateleiraClick,
  onSessaoClick,
  isSelectable = false,
}: LayoutVisualizerProps) {
  const [prateleiraSelected, setPrateleiraSelected] = useState<string | null>(
    null,
  );
  const [sessaoSelected, setSessaoSelected] = useState<string | null>(null);
  const [ruaSelected, setRuaSelected] = useState<string | null>(null);

  let currentRua = isSelectable
    ? ruaSelected
    : currentPosition?.address.split('-')[0];

  if (isSelectable && prateleiraSelected) {
    currentRua = prateleiraSelected.split('-')[0];
  }

  if (isSelectable && sessaoSelected) {
    currentRua = sessaoSelected.split('-')[0];
  }

  const currentRuaData = useMemo(() => {
    return ruas.find((r) => r.nome === currentRua);
  }, [ruas, currentRua]);

  let currentPrateleira = isSelectable
    ? prateleiraSelected
    : currentPosition?.address.split('-').slice(0, 2).join('-');

  if (isSelectable && sessaoSelected) {
    currentPrateleira = sessaoSelected.slice(0, sessaoSelected.lastIndexOf('-'));
  }

  const getSessaoClassName = (
    isCurrentSessao: boolean,
    readings?: SavedReading[],
  ) => {
    let className = 'p-2 rounded-sm border text-center text-sm h-[60px]';

    className += `
        ${
          isCurrentSessao
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-gray-50'
        }
    `;

    if (
      readings &&
      readings.length > 0 &&
      !readings[0].blVazio &&
      readings[0].dadoLeitura
    ) {
      className += 'bg-green-50';
    } else if (readings && readings.length > 0 && readings[0].blVazio) {
      className += 'bg-white';
    } else if (readings && readings.length > 0 && !readings[0].dadoLeitura) {
      className += 'bg-red-50';
    }

    return className;
  };

  return (
    <div className="space-y-8">
      {/* Grid for current rua */}
      {currentRuaData && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">
            Rua {currentRua || ruaSelected}
          </h3>
          <div className="overflow-x-auto">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${currentRuaData.prateleira.length}, 120px)`,
                minWidth: 'min-content',
              }}
            >
              {currentRuaData.prateleira.map((prat) => (
                <div key={prat.nome} className="w-[120px]">
                  <div className="space-y-1">
                    {prat.sessao
                      .sort((a, b) => b.position - a.position)
                      .map((sessao) => {
                        const isCurrentSessao =
                          currentPosition?.address === sessao.nome;
                        return (
                          <div
                            key={sessao.nome}
                            className={getSessaoClassName(
                              isCurrentSessao || sessaoSelected === sessao.nome,
                              allReadings?.[sessao.nome],
                            )}
                            onClick={() => {
                              onSessaoClick?.(sessao.nome);
                              setSessaoSelected((prev) =>
                                prev === sessao.nome ? null : sessao.nome,
                              );
                              setPrateleiraSelected(null);
                              setRuaSelected(null);
                            }}
                          >
                            <div className="flex flex-col items-center justify-between">
                              <span>{sessao.nome}</span>
                              {allReadings &&
                                allReadings[sessao.nome]?.length > 0 &&
                                !allReadings[sessao.nome]?.[0]?.blVazio &&
                                allReadings[sessao.nome]?.[0]?.dadoLeitura && (
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      <QrCodeIcon className="text-gray-900 w-4 h-4" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      <ul>
                                        {allReadings[sessao.nome].map(
                                          (reading) => (
                                            <li key={reading.dadoLeitura}>
                                              {reading.dadoLeitura}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </HoverCardContent>
                                  </HoverCard>
                                )}
                              {isCurrentSessao &&
                                currentPosition?.vertical_direction ===
                                  'up' && (
                                  <span className="text-blue-500">↑</span>
                                )}
                              {isCurrentSessao &&
                                currentPosition?.vertical_direction ===
                                  'down' && (
                                  <span className="text-blue-500">↓</span>
                                )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ruas list */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4">Ruas</h3>
        <div className="overflow-x-auto">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${ruas.length}, 50px)`,
              minWidth: 'min-content',
            }}
          >
            {ruas.map((rua) => (
              <div key={rua.nome} className="w-[50px]">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-center w-full ${
                      currentRua === rua.nome || ruaSelected === rua.nome
                        ? 'text-blue-500'
                        : 'text-gray-500'
                    }`}
                    onClick={() => {
                      onRuaClick?.(rua.nome);
                      setRuaSelected((prev) =>
                        prev === rua.nome ? null : rua.nome,
                      );
                      setPrateleiraSelected(null);
                      setSessaoSelected(null);
                    }}
                  >
                    {rua.nome}
                  </div>
                  {currentRua === rua.nome && (
                    <div className="flex flex-col items-center justify-between">
                      {currentPosition?.z_direction === 'forward' && (
                        <span className="text-blue-500">↑</span>
                      )}
                      {currentPosition?.z_direction === 'backward' && (
                        <span className="text-blue-500">↓</span>
                      )}
                    </div>
                  )}
                </div>
                {rua.prateleira
                  .toSorted((a, b) => b.position - a.position)
                  .map((prateleira) => {
                    const prateleiraName = prateleira.nome.split('-')[1];
                    // console.log(prateleira.nome);
                    return (
                      <div
                        key={prateleira.nome}
                        className={`
                            p-2 rounded-sm border text-center text-sm h-[60px]
                            ${
                              currentPrateleira === prateleira.nome ||
                              prateleiraSelected === prateleira.nome
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-gray-50'
                            }
                        `}
                        onClick={() => {
                          if (isSelectable) {
                            onPrateleiraClick?.(prateleira.nome);
                            setPrateleiraSelected((prev) =>
                              prev === prateleira.nome ? null : prateleira.nome,
                            );
                            setSessaoSelected(null);
                            setRuaSelected(null);
                          }
                        }}
                      >
                        {prateleiraName}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
