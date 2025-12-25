import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const MAX_FILE_SIZE_MB = 50;

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fileUrl = useMemo(() => {
    if (!file) {
      return '';
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', 'rtl');
    root.setAttribute('lang', 'he');
  }, []);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const validateAndSetFile = (selected: File | undefined) => {
    setError('');

    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.type !== 'application/pdf') {
      setError('אנא בחר קובץ PDF בלבד.');
      event.target.value = '';
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`הקובץ גדול מדי. אפשר עד ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    validateAndSetFile(selected);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const selected = event.dataTransfer.files?.[0];
    validateAndSetFile(selected);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const clearFile = () => {
    setFile(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">קורא PDF מקומי</h1>
            <p className="mt-2 text-sm text-slate-300">
              העלו קובץ PDF וצפו בו ישירות בדפדפן. הקובץ נשאר מקומי אצלכם.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
            שמירה מקומית בלבד
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div
                className={`rounded-2xl border border-dashed p-6 transition ${
                  isDragActive
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-white/20 bg-white/5'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <label className="flex flex-col gap-3 text-sm text-slate-200">
                  <span className="text-base font-medium">בחירת קובץ PDF</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={onFileChange}
                    className="file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-400"
                  />
                </label>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>אפשר לגרור קובץ לכאן או לבחור מהמחשב.</span>
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20"
                  >
                    בחר קובץ
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  סטטוס מערכת: {file ? 'מציגה קובץ' : 'מוכנה להעלאה'}
                </span>
                <span className="text-slate-500">
                  הקובץ נטען מקומית בלבד — אין העלאה לשרת.
                </span>
              </div>
              {error ? (
                <p className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              {file ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <span className="font-semibold text-white">{file.name}</span>
                  <span className="text-xs text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)}MB
                  </span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="mr-auto rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/20"
                  >
                    הסרת קובץ
                  </button>
                </div>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {fileUrl ? (
                <iframe
                  title="PDF Viewer"
                  src={fileUrl}
                  className="h-[70vh] w-full"
                />
              ) : (
                <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center text-slate-300">
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm">אין קובץ להצגה</div>
                  <p className="max-w-md text-sm">
                    בחרו קובץ PDF כדי לראות תצוגה מקדימה. תוכלו להגדיל/להקטין בעזרת כלי הדפדפן.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">טיפים לצפייה</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>פתחו קבצים מהתיקייה המקומית — אין העלאה לשרת.</li>
                <li>אפשר לגרור את ה-PDF ישירות על אזור הבחירה.</li>
                <li>השתמשו בחיפוש המובנה בדפדפן כדי לאתר מילים.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              <p className="font-semibold text-white">פורמטים נתמכים</p>
              <p className="mt-2">PDF בלבד, עד {MAX_FILE_SIZE_MB}MB לכל קובץ.</p>
            </div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        נבנה לצפייה מהירה במסמכים — ללא שמירה או העלאה של קבצים.
      </footer>
    </div>
  );
}

export default App;
