import { useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Download, Upload, Copy, Check, Lock } from 'lucide-react';

export default function MasterPresetManager() {
  const { exportPreset, importPreset } = useSettings();
  const [password, setPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!password) {
      setError('Please enter a password to encrypt the preset.');
      return;
    }
    setError('');
    await exportPreset(password);
    setPassword('');
  };

  const handleImportClick = () => {
    if (!importPassword) {
      setError('Please enter the password to decrypt the preset.');
      return;
    }
    setError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await importPreset(file, importPassword);
    setImportPassword('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5">
        <h3 className="text-sm font-medium text-aura-text flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Export Encrypted Preset
        </h3>
        <p className="text-xs text-aura-muted">
          Save your entire dashboard configuration to a securely encrypted JSON file.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Encryption Password"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-aura-text focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={handleExport}
            disabled={!password}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5">
        <h3 className="text-sm font-medium text-aura-text flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Encrypted Preset
        </h3>
        <p className="text-xs text-aura-muted">
          Restore your dashboard configuration from an encrypted JSON file.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={importPassword}
            onChange={(e) => setImportPassword(e.target.value)}
            placeholder="Decryption Password"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-aura-text focus:outline-none focus:border-orange-500 transition-colors"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            disabled={!importPassword}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    </div>
  );
}
