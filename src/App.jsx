import React, { useRef, useState } from 'react';
import { Download, Image as ImageIcon, Upload, Zap, ShieldCheck, Github } from 'lucide-react';
import ImageTracer from 'imagetracerjs';

const optionsFor = (detail, colors) => ({
  ltres: detail,
  qtres: detail,
  pathomit: 8,
  numberofcolors: colors,
  colorquantcycles: 3,
  scale: 1,
  strokewidth: 1,
  linefilter: true,
  roundcoords: 2,
  viewbox: true
});

export default function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [svgUrl, setSvgUrl] = useState('');
  const [svgText, setSvgText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [detail, setDetail] = useState(1);
  const [colors, setColors] = useState(16);

  const vectorize = (selectedFile = file) => {
    if (!selectedFile) return;
    setProcessing(true);
    const url = URL.createObjectURL(selectedFile);
    setSourceUrl(url);

    const image = new window.Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const max = 1200;
        const ratio = Math.min(max / image.width, max / image.height, 1);
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');

        ImageTracer.imageToSVG(dataUrl, (svg) => {
          setSvgText(svg);
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          setSvgUrl(URL.createObjectURL(blob));
          setProcessing(false);
        }, optionsFor(detail, colors));
      } catch (error) {
        console.error(error);
        setProcessing(false);
      }
    };
    image.src = url;
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile?.type.startsWith('image/')) return;
    setFile(selectedFile);
    vectorize(selectedFile);
  };

  const download = () => {
    if (!svgText) return;
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${file?.name?.replace(/\.[^.]+$/, '') || 'vector'}-vector.svg`;
    link.click();
  };

  return (
    <main>
      <nav>
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-mark"><Zap size={17} fill="currentColor" /></span>
          VectorPro <strong>AI</strong>
        </button>
        <a className="github" href="https://github.com/cr0ok3deagle-cpu/vectorpro-ai-arnoud" target="_blank" rel="noreferrer">
          <Github size={17} /> GitHub
        </a>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span /> AI-POWERED VECTORIZATION</div>
        <h1>Turn pixels into<br /><em>perfect vectors.</em></h1>
        <p>Convert any image to a crisp, scalable SVG in seconds.<br />Private, fast, and free — right in your browser.</p>

        <div className={`dropzone ${dragging ? 'dragging' : ''} ${sourceUrl ? 'has-file' : ''}`} 
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventPreventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}>
          {!sourceUrl ? (
            <button className="upload-area" onClick={() => inputRef.current?.click()}>
              <span className="upload-icon"><Upload size={26} /></span>
              <b>Drop your image here</b>
              <span>or <u>browse files</u></span>
              <small>PNG, JPG, WEBP · Up to 20 MB</small>
            </button>
          ) : (
            <div className="preview-grid">
              <div className="preview-card">
                <header>ORIGINAL</header>
                <img src={sourceUrl} alt="Original" />
              </div>
              <div className="preview-card vector-card">
                <header>VECTOR <span>{processing ? 'Processing…' : 'Ready'}</span></header>
                {svgUrl ? <img src={svgUrl} alt="Vector preview" /> : <div className="loader" />}
              </div>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {sourceUrl && (
          <div className="controls">
            <label>Detail <input type="range" min="0.5" max="3" step="0.5" value={detail}
              onChange={(e) => setDetail(Number(e.target.value))} /></label>
            <label>Colors <input type="range" min="2" max="32" step="2" value={colors}
              onChange={(e) => setColors(Number(e.target.value))} /></label>
            <button className="retry" onClick={() => vectorize()} disabled={processing}>Re-vectorize</button>
            <button className="download" onClick={download} disabled={!svgText || processing}><Download size={18} /> Download SVG</button>
          </div>
        )}

        <div className="features">
          <div><Zap size={20} /><span><b>Lightning fast</b><small>Instant browser processing</small></span></div>
          <div><ShieldCheck size={20} /><span><b>100% private</b><small>Images never leave your device</small></span></div>
          <div><ImageIcon size={20} /><span><b>Infinite scale</b><small>Crystal-clear SVG output</small></span></div>
        </div>
      </section>
    </main>
  );
}
