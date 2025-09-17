import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import Button from '../common/Button'
import { Input } from '../common/Input'

interface SmartTimeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (timeLog: any) => void
}

export default function SmartTimeModal({ isOpen, onClose, onSave }: SmartTimeModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedHours, setSelectedHours] = useState(1)
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [preciseHours, setPreciseHours] = useState(0)
  const [preciseMinutes, setPreciseMinutes] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [customer, setCustomer] = useState('')
  const [project, setProject] = useState('')
  const [useQuickTime, setUseQuickTime] = useState(true)

  const hourOptions = [1, 2, 4, 8]
  const minuteOptions = [15, 30, 45]

  const getTotalMinutes = () => {
    if (useQuickTime) {
      return selectedHours * 60 + selectedMinutes
    } else {
      return preciseHours * 60 + preciseMinutes
    }
  }

  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}t ${minutes}min`
  }

  const handleSave = () => {
    const timeLog = {
      date,
      hours: getTotalMinutes() / 60,
      description,
      category,
      priority,
      customer,
      project,
      created_at: new Date().toISOString()
    }
    onSave(timeLog)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-blue-600">Smart Tidsregistrering</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dato
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Work Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Arbejdstid
            </label>
            
            {/* Quick Time Selection */}
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="quick-time"
                  checked={useQuickTime}
                  onChange={() => setUseQuickTime(true)}
                  className="mr-2"
                />
                <label htmlFor="quick-time" className="text-sm text-gray-700">
                  Hurtig tidsvalg
                </label>
              </div>
              
              {useQuickTime && (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Timer:</span>
                    <div className="flex space-x-2">
                      {hourOptions.map((hour) => (
                        <button
                          key={hour}
                          onClick={() => setSelectedHours(hour)}
                          className={`px-3 py-2 text-sm rounded border ${
                            selectedHours === hour
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {hour}t
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Minutter:</span>
                    <div className="flex space-x-2">
                      {minuteOptions.map((minute) => (
                        <button
                          key={minute}
                          onClick={() => setSelectedMinutes(minute)}
                          className={`px-3 py-2 text-sm rounded border ${
                            selectedMinutes === minute
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {minute}min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Precise Time Selection */}
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="precise-time"
                  checked={!useQuickTime}
                  onChange={() => setUseQuickTime(false)}
                  className="mr-2"
                />
                <label htmlFor="precise-time" className="text-sm text-gray-700">
                  Præcis tid
                </label>
              </div>
              
              {!useQuickTime && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Timer</span>
                      <button
                        onClick={() => setPreciseHours(Math.max(0, preciseHours - 1))}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-lg font-medium text-blue-600">
                        {preciseHours}
                      </span>
                      <button
                        onClick={() => setPreciseHours(preciseHours + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Minutter</span>
                      <button
                        onClick={() => setPreciseMinutes(Math.max(0, preciseMinutes - 1))}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-lg font-medium text-blue-600">
                        {preciseMinutes}
                      </span>
                      <button
                        onClick={() => setPreciseMinutes(preciseMinutes + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Time Display */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Total tid</div>
                <div className="text-2xl font-bold text-blue-600">
                  {getTotalMinutes()}min
                </div>
                <div className="text-xs text-gray-500">
                  ({(getTotalMinutes() / 60).toFixed(2)} timer)
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivelse af arbejdet
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv detaljeret hvad du arbejdede på..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="mt-2 text-xs text-gray-500">
              Beskriv dit arbejde og brug "AI Hjælp" for at forbedre beskrivelsen
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Vælg kategori</option>
                <option value="development">Udvikling</option>
                <option value="meeting">Møde</option>
                <option value="planning">Planlægning</option>
                <option value="testing">Test</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritet
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Normal">Normal</option>
                <option value="Høj">Høj</option>
                <option value="Lav">Lav</option>
              </select>
            </div>
          </div>

          {/* Customer and Project */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kunde
              </label>
              <Input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Kunde navn eller firma"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projekt
              </label>
              <Input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Projekt navn"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Annuller
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
          >
            Gem tidsregistrering
          </Button>
        </div>
      </div>
    </div>
  )
}
