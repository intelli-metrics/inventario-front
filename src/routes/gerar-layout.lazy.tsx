import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

interface FormData {
  rua_inicio: string
  rua_fim: string
  rua_step: number
  rua_prefixo: string
  rua_num_digits: number
  prateleira_inicio: string
  prateleira_fim: string
  prateleira_step: number
  prateleira_prefixo: string
  prateleira_num_digits: number
  sessao_inicio: string
  sessao_fim: string
  sessao_step: number
  sessao_prefixo: string
  sessao_num_digits: number
}

const initialFormData: FormData = {
  rua_inicio: '0',
  rua_fim: '0',
  rua_step: 1,
  rua_prefixo: '',
  rua_num_digits: 3,
  prateleira_inicio: '0',
  prateleira_fim: '0',
  prateleira_step: 1,
  prateleira_prefixo: '',
  prateleira_num_digits: 3,
  sessao_inicio: '0',
  sessao_fim: '0',
  sessao_step: 1,
  sessao_prefixo: '',
  sessao_num_digits: 2,
}

const API_URL = import.meta.env.VITE_API_URL;

export const Route = createLazyFileRoute('/gerar-layout')({
  component: GerarLayout,
})

function GerarLayout() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/create-layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        alert(
          `Layout created successfully!\nCreated:\n${data.ruas} ruas\n${data.prateleiras} prateleiras\n${data.sessoes} sessoes`
        )
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating layout')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInputGroup = (prefix: string, label: string) => (
    <div className="mb-6">
      <label className="font-bold text-lg mb-2">{label}:</label>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <span className="block text-sm text-gray-600">Início</span>
          <input
            name={`${prefix}_inicio`}
            value={formData[`${prefix}_inicio` as keyof FormData]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-white"
            required
          />
        </div>
        <div>
          <span className="block text-sm text-gray-600">Fim</span>
          <input
            name={`${prefix}_fim`}
            value={formData[`${prefix}_fim` as keyof FormData]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-white"
            required
          />
        </div>
        <div>
          <span className="block text-sm text-gray-600">Step</span>
          <input
            name={`${prefix}_step`}
            value={formData[`${prefix}_step` as keyof FormData]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-white"
            required
          />
        </div>
        <div>
          <span className="block text-sm text-gray-600">Prefixo</span>
          <input
            type="text"
            name={`${prefix}_prefixo`}
            value={formData[`${prefix}_prefixo` as keyof FormData]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
        <div>
          <span className="block text-sm text-gray-600">Num Digits</span>
          <input
            name={`${prefix}_num_digits`}
            value={formData[`${prefix}_num_digits` as keyof FormData]}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-white"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Setup Layout</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {renderInputGroup('rua', 'Rua')}
        {renderInputGroup('prateleira', 'Prateleira')} 
        {renderInputGroup('sessao', 'Sessão')}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 text-white rounded-lg text-lg font-semibold 
            ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
        >
          {isSubmitting ? 'Criando Layout...' : 'Criar Layout'}
        </button>
      </form>
    </div>
  )
}
