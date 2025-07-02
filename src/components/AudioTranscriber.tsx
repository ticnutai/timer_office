import React, { useState } from 'react';
import { transcribeAudio } from '../utils/openai';

export const AudioTranscriber: React.FC = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const text = await transcribeAudio(file);
      setResult(text);
    } catch (err) {
      console.error(err);
      setResult('נכשל התמלול');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block mb-2 font-semibold">בחר קובץ שמע לתמלול</label>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      {loading && <p className="mt-2">מטעין...</p>}
      {result && !loading && (
        <pre className="mt-4 p-2 bg-gray-100 rounded-xl whitespace-pre-wrap">{result}</pre>
      )}
    </div>
  );
};
