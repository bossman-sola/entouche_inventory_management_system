import { useState, useCallback } from "react";
import { Icon, icons } from "../../../lib/icons";

export function FileDropzone({ file, validated, fileRef, onFile, onCancel }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) onFile(f);
  }, [onFile]);

  return (
    <>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 px-4 transition-all cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : file ? "border-gray-200 bg-gray-50 cursor-default" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"}`}
      >
        {!file ? (
          <>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Icon d={icons.cloudUp} size={22} className="text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700 text-center">Drag & drop your file here</p>
            <p className="text-xs text-gray-400 mt-1">CSV or XLSX files supported</p>
            <button
              onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Browse Files
            </button>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <Icon d={icons.fileGreen} size={20} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={e => { e.stopPropagation(); onCancel(); }} className="text-gray-400 hover:text-gray-600 shrink-0">
                <Icon d={icons.xSmall} size={14} />
              </button>
            </div>
            {!validated && (
              <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }} className="mt-2 text-xs text-blue-600 hover:underline w-full text-center">
                Change file
              </button>
            )}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => onFile(e.target.files[0])} />
    </>
  );
}