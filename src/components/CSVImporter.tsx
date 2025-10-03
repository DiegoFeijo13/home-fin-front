import React, { useState } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface CSVImporterProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

type BankType = 'C6' | 'Nubank';

interface ImportStatus {
  type: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  details?: string;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ onClose, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankType>('C6');
  const [status, setStatus] = useState<ImportStatus>({ type: 'idle' });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar se é arquivo CSV
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setStatus({
          type: 'error',
          message: 'Formato inválido',
          details: 'Por favor, selecione um arquivo CSV (.csv)'
        });
        return;
      }

      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({
          type: 'error',
          message: 'Arquivo muito grande',
          details: 'O arquivo deve ter no máximo 5MB'
        });
        return;
      }

      setSelectedFile(file);
      setStatus({ type: 'idle' });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Simular seleção de arquivo
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      handleFileSelect({ target: input } as any);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setStatus({
        type: 'error',
        message: 'Nenhum arquivo selecionado',
        details: 'Por favor, selecione um arquivo CSV para importar'
      });
      return;
    }

    setStatus({ type: 'uploading', message: 'Enviando arquivo...' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bank', selectedBank);

      const response = await fetch('/api/accounts/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setStatus({
        type: 'success',
        message: 'Importação concluída com sucesso!',
        details: `${result.imported || 0} contas foram importadas`
      });

      // Aguardar um pouco antes de fechar e atualizar
      setTimeout(() => {
        onImportSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erro na importação:', error);
      setStatus({
        type: 'error',
        message: 'Erro na importação',
        details: error instanceof Error ? error.message : 'Erro desconhecido ao processar o arquivo'
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBankDescription = (bank: BankType): string => {
    switch (bank) {
      case 'C6':
        return 'Extrato do C6 Bank (formato padrão)';
      case 'Nubank':
        return 'Extrato do Nubank (formato padrão)';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Importar Contas</h2>
                <p className="text-sm text-gray-600">Importe contas de um arquivo CSV</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              disabled={status.type === 'uploading'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Seleção do Banco */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecione o banco *
            </label>
            <div className="space-y-2">
              {(['C6', 'Nubank'] as BankType[]).map((bank) => (
                <label key={bank} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                  <input
                    type="radio"
                    name="bank"
                    value={bank}
                    checked={selectedBank === bank}
                    onChange={(e) => setSelectedBank(e.target.value as BankType)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    disabled={status.type === 'uploading'}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{bank}</div>
                    <div className="text-xs text-gray-500">{getBankDescription(bank)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Upload de Arquivo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Arquivo CSV *
            </label>
            
            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-gray-500">
                  Apenas arquivos CSV (máximo 5MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={status.type === 'uploading'}
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  {status.type !== 'uploading' && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setStatus({ type: 'idle' });
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {status.type !== 'idle' && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              status.type === 'success' ? 'bg-green-50 border border-green-200' :
              status.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {status.type === 'uploading' && <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />}
              {status.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {status.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              
              <div>
                <p className={`text-sm font-medium ${
                  status.type === 'success' ? 'text-green-800' :
                  status.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {status.message}
                </p>
                {status.details && (
                  <p className={`text-xs mt-1 ${
                    status.type === 'success' ? 'text-green-600' :
                    status.type === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {status.details}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Instruções:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Exporte o extrato do seu banco em formato CSV</li>
              <li>• Selecione o banco correspondente ao arquivo</li>
              <li>• O arquivo será processado e as contas importadas automaticamente</li>
              <li>• Contas duplicadas serão ignoradas</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={!selectedFile || status.type === 'uploading' || status.type === 'success'}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.type === 'uploading' ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar Contas
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={status.type === 'uploading'}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.type === 'success' ? 'Fechar' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};