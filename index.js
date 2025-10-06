// Tailwind config is normally applied at build-time. Guard access to avoid runtime ReferenceError
try {
    if (typeof window !== 'undefined') {
        window.tailwind = window.tailwind || {};
        window.tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        'primary-dark': '#1a1a2e',
                        'secondary-dark': '#2c2c54',
                        'pad-base': '#3f3f7a',
                        'pad-hover': '#4a4a8d',
                        'accent': '#ffc107',
                    }
                }
            }
        };
    }
} catch (err) {
    // Não é crítico — apenas evita que o script pare se "tailwind" não existir
    console.warn('Não foi possível aplicar tailwind.config em tempo de execução:', err);
}

    // Variáveis globais para o contexto de áudio
     let audioContext;
     // Como o script é carregado no fim do body, os elementos já existem — mas vamos buscar com segurança
     const display = document.getElementById('display');
     const drumGrid = document.getElementById('drum-grid');
     const addPadButton = document.getElementById('add-pad-button');
     const editModal = document.getElementById('edit-modal');
     const editForm = document.getElementById('edit-form');
     const cancelEdit = document.getElementById('cancel-edit');
     const editPadId = document.getElementById('edit-pad-id');
     const editName = document.getElementById('edit-name');
     const editKey = document.getElementById('edit-key');
     const editColor = document.getElementById('edit-color');
     const editAudio = document.getElementById('edit-audio');
    const editVolume = document.getElementById('edit-volume');
     const deletePadButton = document.getElementById('delete-pad-button');
     const increaseSizeButton = document.getElementById('increase-size-button');
     const decreaseSizeButton = document.getElementById('decrease-size-button');
    const audioDropZone = document.getElementById('audio-drop-zone');
    const audioFileInput = document.getElementById('audio-file-input');
    const audioLibraryList = document.getElementById('audio-library-list');
    const saveProjectBtn = document.getElementById('save-project');
    const loadProjectBtn = document.getElementById('load-project');
    const exportProjectBtn = document.getElementById('export-project');
    const importProjectInput = document.getElementById('import-project');
    const clearPadsBtn = document.getElementById('clear-pads');
    const resetLibraryBtn = document.getElementById('reset-library');
    const globalVolume = document.getElementById('global-volume');
const themeToggle = document.getElementById('theme-toggle');
const manualToggle = document.getElementById('manual-toggle');
const manualFooter = document.getElementById('manual-footer');
const manualClose = document.getElementById('manual-close');

// Tema: light/dark via mudanças nas CSS variables
function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.style.setProperty('--bg-1', '#f7fafc');
        root.style.setProperty('--card', 'rgba(0,0,0,0.04)');
        root.style.setProperty('--muted', 'rgba(15,23,42,0.7)');
        root.style.setProperty('--accent', '#2563eb');
        document.body.classList.add('light-theme');
    } else {
        root.style.setProperty('--bg-1', '#0b1020');
        root.style.setProperty('--card', 'rgba(255,255,255,0.06)');
        root.style.setProperty('--muted', 'rgba(255,255,255,0.6)');
        root.style.setProperty('--accent', '#ffc107');
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('cospad_theme', theme);
}

// Inicializa tema a partir do localStorage
const savedTheme = localStorage.getItem('cospad_theme') || 'dark';
applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const next = (localStorage.getItem('cospad_theme') === 'light') ? 'dark' : 'light';
        applyTheme(next);
    });
}

if (manualToggle && manualFooter) {
    manualToggle.addEventListener('click', () => {
        manualFooter.classList.remove('hidden');
        manualFooter.scrollIntoView({ behavior: 'smooth' });
    });
}

if (manualClose && manualFooter) {
    manualClose.addEventListener('click', () => {
        manualFooter.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

        
        // Verifica se os elementos do DOM necessários existem
        if (!drumGrid) {
            console.error('Elemento com id "drum-grid" não encontrado. Verifique o HTML.');
        }

        function renderAudioLibrary() {
            if (!audioLibraryList) return;
            audioLibraryList.innerHTML = '';
            audioLibrary.forEach(item => {
                const row = document.createElement('div');
                row.classList.add('flex', 'items-center', 'justify-between', 'p-2', 'bg-white/10', 'rounded');
                row.draggable = true;
                row.dataset.audioId = item.id;

                const name = document.createElement('div');
                name.textContent = item.name;

                const actions = document.createElement('div');
                const btnAssign = document.createElement('button');
                btnAssign.textContent = 'Atribuir';
                btnAssign.classList.add('mr-2','bg-accent','text-white','p-1','rounded','text-sm');
                btnAssign.addEventListener('click', () => {
                    // atribui ao primeiro pad selecionado (ou ao primeiro pad) — por simplicidade, usar primeiro pad
                    if (drumPads.length > 0) {
                        drumPads[0].audioSrc = item.src;
                        savePads();
                        setupDrumPads();
                    }
                });

                const btnPlay = document.createElement('button');
                btnPlay.textContent = '▶';
                btnPlay.classList.add('bg-gray-700','text-white','p-1','rounded','text-sm');
                btnPlay.addEventListener('click', () => {
                    const audio = new Audio(item.src);
                    audio.play();
                });

                const btnRemove = document.createElement('button');
                btnRemove.textContent = 'Remover';
                btnRemove.classList.add('ml-2','bg-red-600','text-white','p-1','rounded','text-sm');
                btnRemove.addEventListener('click', () => {
                    audioLibrary = audioLibrary.filter(a => a.id !== item.id);
                    saveLibrary();
                    renderAudioLibrary();
                });

                actions.appendChild(btnAssign);
                actions.appendChild(btnPlay);
                actions.appendChild(btnRemove);

                row.appendChild(name);
                row.appendChild(actions);

                // dragstart para arrastar o id do áudio
                row.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    e.dataTransfer.effectAllowed = 'copy';
                });

                audioLibraryList.appendChild(row);
            });
        }

        // Lida com arquivos locais (File -> dataURL)
        function handleFiles(files) {
            const fileArr = Array.from(files);
            fileArr.forEach(file => {
                if (!file.type.startsWith('audio/')) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const id = 'lib-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
                    audioLibrary.push({ id, name: file.name, src: ev.target.result });
                    saveLibrary();
                    renderAudioLibrary();
                };
                reader.readAsDataURL(file);
            });
        }

        // Handlers para input e drop zone
        if (audioFileInput) {
            audioFileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
                audioFileInput.value = '';
            });
        }

        if (audioDropZone) {
            audioDropZone.addEventListener('dragover', (e) => { e.preventDefault(); audioDropZone.classList.add('bg-white/30'); });
            audioDropZone.addEventListener('dragleave', (e) => { e.preventDefault(); audioDropZone.classList.remove('bg-white/30'); });
            audioDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                audioDropZone.classList.remove('bg-white/30');
                if (e.dataTransfer.files && e.dataTransfer.files.length) {
                    handleFiles(e.dataTransfer.files);
                }
            });
        }
        if (!display) {
            console.error('Elemento com id "display" não encontrado. Verifique o HTML.');
        }

        // Dados dos pads: Tecla, nome, cor e fonte do áudio
        let drumPads = [];
        let gridCols = 3;
        let activeAudio = {}; // Objeto para rastrear áudios ativos por cor
        let audioLibrary = []; // { id, name, src (dataURL or url) }
        let tracks = []; // { id, name, audioSrc, volume, muted }

        const addTrackButton = document.getElementById('add-track-button');
        const tracksList = document.getElementById('tracks-list');

        function saveTracks() {
            localStorage.setItem('tracks', JSON.stringify(tracks));
        }

        function loadTracks() {
            const saved = localStorage.getItem('tracks');
            if (saved) {
                try { tracks = JSON.parse(saved); } catch (e) { tracks = []; }
            }
        }

        function renderTracks() {
            if (!tracksList) return;
            tracksList.innerHTML = '';
            tracks.forEach(track => {
                const row = document.createElement('div');
                row.classList.add('p-2','bg-white/10','rounded','flex','items-center','justify-between');

                const info = document.createElement('div');
                info.classList.add('flex','items-center','gap-3');
                // vizualização: canvas para waveform ou ícone
                const viz = document.createElement('div');
                viz.style.width = '140px';
                viz.style.height = '40px';
                viz.style.display = 'flex';
                viz.style.alignItems = 'center';
                viz.style.justifyContent = 'center';
                const name = document.createElement('div');
                name.textContent = track.name || 'Faixa';

                const audioEl = document.createElement('audio');
                audioEl.src = track.audioSrc || '';
                audioEl.preload = 'auto';
                audioEl.id = `track-audio-${track.id}`;
                // aplica estado de loop salvo
                audioEl.loop = !!track.loop;

                // Controls (play/pause, progress seek, volume, mute, remove)
                const controls = document.createElement('div');
                controls.classList.add('flex','items-center','gap-2');

                const btnPlay = document.createElement('button');
                btnPlay.textContent = '▶';
                btnPlay.classList.add('bg-green-600','text-white','p-1','rounded');
                btnPlay.addEventListener('click', () => {
                    if (audioEl.paused) audioEl.play(); else audioEl.pause();
                });

                // Progress bar (0..100 percent)
                const progress = document.createElement('input');
                progress.type = 'range';
                progress.min = 0; progress.max = 100; progress.step = 0.1;
                progress.value = 0;
                progress.style.width = '220px';
                progress.draggable = false;
                // flag para saber se o usuário está arrastando
                progress._dragging = false;
                progress.addEventListener('mousedown', () => { progress._dragging = true; });
                progress.addEventListener('mouseup', () => { progress._dragging = false; });
                progress.addEventListener('input', () => {
                    if (!audioEl.duration || isNaN(audioEl.duration)) return;
                    audioEl.currentTime = (progress.value / 100) * audioEl.duration;
                });

                const vol = document.createElement('input');
                vol.type = 'range';
                vol.min = 0; vol.max = 1; vol.step = 0.01;
                vol.value = track.volume ?? 1;
                vol.addEventListener('input', () => {
                    audioEl.volume = vol.value;
                    track.volume = parseFloat(vol.value);
                    saveTracks();
                });

                const mute = document.createElement('button');
                mute.textContent = track.muted ? 'Unmute' : 'Mute';
                mute.classList.add('bg-gray-700','text-white','p-1','rounded');
                mute.addEventListener('click', () => {
                    track.muted = !track.muted;
                    audioEl.muted = track.muted;
                    mute.textContent = track.muted ? 'Unmute' : 'Mute';
                    saveTracks();
                });

                const repeatBtn = document.createElement('button');
                repeatBtn.textContent = track.loop ? 'Loop: On' : 'Loop: Off';
                repeatBtn.classList.add('bg-blue-600','text-white','p-1','rounded');
                repeatBtn.addEventListener('click', () => {
                    track.loop = !track.loop;
                    audioEl.loop = !!track.loop;
                    repeatBtn.textContent = track.loop ? 'Loop: On' : 'Loop: Off';
                    saveTracks();
                });

                const btnRemove = document.createElement('button');
                btnRemove.textContent = 'Remover';
                btnRemove.classList.add('bg-red-600','text-white','p-1','rounded');
                btnRemove.addEventListener('click', () => {
                    tracks = tracks.filter(t => t.id !== track.id);
                    saveTracks();
                    renderTracks();
                });

                // Atualizações relacionadas ao audioEl (apenas quando existe src)
                audioEl.addEventListener('loadedmetadata', () => {
                    // set initial volume/mute
                    audioEl.volume = track.volume ?? 1;
                    audioEl.muted = !!track.muted;
                    // set progress to current time
                    progress.value = audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0;
                });

                audioEl.addEventListener('timeupdate', () => {
                    if (!progress._dragging && audioEl.duration) {
                        progress.value = (audioEl.currentTime / audioEl.duration) * 100;
                    }
                });

                audioEl.addEventListener('play', () => { btnPlay.textContent = '▌▌'; });
                audioEl.addEventListener('pause', () => { btnPlay.textContent = '▶'; });

                controls.appendChild(btnPlay);
                controls.appendChild(progress);
                controls.appendChild(vol);
                controls.appendChild(mute);
                controls.appendChild(repeatBtn);
                controls.appendChild(btnRemove);

                // Se a faixa já tem áudio, adiciona elemento audio para reprodução e waveform
                if (track.audioSrc) {
                    // atualiza volume/mute
                    audioEl.volume = track.volume ?? 1;
                    audioEl.muted = !!track.muted;
                    // mantém ref no DOM para possível uso
                    row.appendChild(audioEl);

                    const canvas = document.createElement('canvas');
                    canvas.width = 140;
                    canvas.height = 40;
                    canvas.style.borderRadius = '4px';
                    canvas.style.background = 'rgba(0,0,0,0.12)';
                    viz.appendChild(canvas);

                    drawWaveformFromSrc(track.audioSrc, canvas).catch(() => {
                        viz.removeChild(canvas);
                        const icon = document.createElement('div');
                        icon.textContent = '🔊';
                        viz.appendChild(icon);
                    });
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.textContent = '—';
                    viz.appendChild(placeholder);
                }

                info.appendChild(viz);
                info.appendChild(name);
                row.appendChild(info);
                row.appendChild(controls);

                // Drag and drop: aceita áudio da biblioteca
                row.addEventListener('dragover', (e) => { e.preventDefault(); row.classList.add('ring-2'); });
                row.addEventListener('dragleave', () => { row.classList.remove('ring-2'); });
                row.addEventListener('drop', (e) => {
                    e.preventDefault(); row.classList.remove('ring-2');
                    const audioId = e.dataTransfer.getData('text/plain');
                    const item = audioLibrary.find(a => a.id === audioId);
                    if (item) {
                        track.audioSrc = item.src;
                        track.name = item.name;
                        saveTracks();
                        renderTracks();
                    }
                });

                tracksList.appendChild(row);
            });
        }

        // Adiciona nova faixa
        if (addTrackButton) {
            addTrackButton.addEventListener('click', () => {
                const id = 'track-' + Date.now();
                tracks.push({ id, name: 'Faixa ' + (tracks.length + 1), audioSrc: '', volume: 1, muted: false, loop: false });
                saveTracks();
                renderTracks();
            });
        }

    // Elementos da biblioteca (declarados anteriormente)

        function savePads() {
            localStorage.setItem('drumPads', JSON.stringify(drumPads));
        }

        // Desenha waveform simples num canvas a partir de um src (dataURL ou url)
        async function drawWaveformFromSrc(src, canvas) {
            if (!src) throw new Error('no src');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // Cria um AudioContext temporário para decodificar
            const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, 44100);

            // Obtém arraybuffer do src
            let arrayBuffer;
            if (src.startsWith('data:audio')) {
                // dataURL -> arraybuffer
                const res = src.split(',')[1];
                const binStr = atob(res);
                const len = binStr.length;
                const bytes = new Uint8Array(len);
                for (let i=0;i<len;i++) bytes[i] = binStr.charCodeAt(i);
                arrayBuffer = bytes.buffer;
            } else {
                const r = await fetch(src);
                arrayBuffer = await r.arrayBuffer();
            }

            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

            // pega dados do canal 0
            const channelData = audioBuffer.getChannelData(0);
            const step = Math.ceil(channelData.length / canvas.width);
            const amp = canvas.height / 2;

            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i++) {
                const start = i * step;
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = channelData[start + j];
                    if (datum === undefined) break;
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                const x = i;
                const y1 = (1 + min) * amp;
                const y2 = (1 + max) * amp;
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        function saveLibrary() {
            try {
                localStorage.setItem('audioLibrary', JSON.stringify(audioLibrary));
            } catch (e) {
                console.warn('Não foi possível salvar biblioteca (tamanho muito grande?):', e);
            }
        }

        // Project save/load/export/import
        function saveProject() {
            const data = { drumPads, audioLibrary, tracks, gridCols };
            localStorage.setItem('cospad_project', JSON.stringify(data));
            alert('Projeto salvo no localStorage (cospad_project).');
        }

        function loadProject() {
            const saved = localStorage.getItem('cospad_project');
            if (!saved) { alert('Nenhum projeto salvo encontrado.'); return; }
            try {
                const data = JSON.parse(saved);
                drumPads = data.drumPads || drumPads;
                audioLibrary = data.audioLibrary || audioLibrary;
                tracks = data.tracks || tracks;
                gridCols = data.gridCols || gridCols;
                savePads(); saveLibrary(); saveGridCols(); saveTracks();
                setupDrumPads(); renderAudioLibrary(); renderTracks();
                alert('Projeto carregado.');
            } catch (e) { alert('Projeto inválido.'); }
        }

        function exportProject() {
            const data = { drumPads, audioLibrary, tracks, gridCols };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'cospad-project.json'; document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
        }

        if (importProjectInput) {
            importProjectInput.addEventListener('change', (e) => {
                const f = e.target.files[0]; if (!f) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        drumPads = data.drumPads || drumPads;
                        audioLibrary = data.audioLibrary || audioLibrary;
                        tracks = data.tracks || tracks;
                        gridCols = data.gridCols || gridCols;
                        savePads(); saveLibrary(); saveGridCols(); saveTracks();
                        setupDrumPads(); renderAudioLibrary(); renderTracks();
                        alert('Projeto importado.');
                    } catch (err) { alert('Arquivo inválido.'); }
                };
                reader.readAsText(f);
            });
        }

        if (saveProjectBtn) saveProjectBtn.addEventListener('click', saveProject);
        if (loadProjectBtn) loadProjectBtn.addEventListener('click', loadProject);
        if (exportProjectBtn) exportProjectBtn.addEventListener('click', exportProject);

        if (clearPadsBtn) {
            clearPadsBtn.addEventListener('click', () => {
                if (!confirm('Remover todos os pads?')) return;
                drumPads = [];
                savePads();
                setupDrumPads();
            });
        }

        if (resetLibraryBtn) {
            resetLibraryBtn.addEventListener('click', () => {
                if (!confirm('Remover todos áudios da biblioteca?')) return;
                audioLibrary = [];
                saveLibrary();
                renderAudioLibrary();
            });
        }

        // volume global — aplica aos <audio> existentes e futuro
        if (globalVolume) {
            globalVolume.addEventListener('input', () => {
                const v = parseFloat(globalVolume.value);
                document.querySelectorAll('audio').forEach(a => { a.volume = v; });
            });
        }

        // metrônomo removido

        function loadPads() {
            const savedPads = localStorage.getItem('drumPads');
            if (savedPads) {
                drumPads = JSON.parse(savedPads);
            } else {
                // Dados iniciais se não houver nada salvo
                drumPads = [
                    { key: 'Q', id: 'pad-q', name: 'Kick', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-1.mp3' },
                    { key: 'W', id: 'pad-w', name: 'Snare', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-2.mp3' },
                    { key: 'E', id: 'pad-e', name: 'Clap', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-3.mp3' },
                    { key: 'A', id: 'pad-a', name: 'Hi-Hat', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-4.mp3' },
                    { key: 'S', id: 'pad-s', name: 'Perc 1', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-5.mp3' },
                    { key: 'D', id: 'pad-d', name: 'Perc 2', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-6.mp3' },
                    { key: 'Z', id: 'pad-z', name: 'Crash', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-7.mp3' },
                    { key: 'X', id: 'pad-x', name: 'Tom L', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-8.mp3' },
                    { key: 'C', id: 'pad-c', name: 'Tom H', color: '#ffc107', audioSrc: 'https://www.soundjay.com/buttons/sounds/button-9.mp3' },
                ];
            }
            const savedGridCols = localStorage.getItem('gridCols');
            if (savedGridCols) {
                gridCols = parseInt(savedGridCols, 10);
            }

            // Carrega biblioteca de áudio
            const savedLib = localStorage.getItem('audioLibrary');
            if (savedLib) {
                try {
                    audioLibrary = JSON.parse(savedLib);
                } catch (e) {
                    audioLibrary = [];
                }
            }
        }

        function saveGridCols() {
            localStorage.setItem('gridCols', gridCols);
        }

        function updateGridClass() {
            drumGrid.className = `grid grid-cols-${gridCols} gap-3 md:gap-4`;
        }

        // Função para inicializar o AudioContext
        // Isso é necessário porque alguns navegadores exigem uma interação do usuário antes de criar o contexto de áudio.
        function initAudioContext() {
            if (!audioContext) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.error('Web Audio API não é suportado neste navegador:', e);
                }
            }
        }

        // Função para tocar o som e atualizar o display
        function playSound(pad) {
            initAudioContext();
            const audioElement = document.getElementById(`audio-${pad.key}`);
            
            if (audioElement) {
                // Para qualquer áudio que esteja tocando com a mesma cor e não seja o mesmo elemento
                if (activeAudio[pad.color] && activeAudio[pad.color] !== audioElement) {
                    activeAudio[pad.color].pause();
                    activeAudio[pad.color].currentTime = 0;
                }

                // Toca o novo áudio
                audioElement.currentTime = 0;
                audioElement.play();

                // Armazena o áudio que está tocando para esta cor
                activeAudio[pad.color] = audioElement;

                // Quando o áudio terminar, remove-o do activeAudio
                audioElement.onended = () => {
                    if (activeAudio[pad.color] === audioElement) {
                        delete activeAudio[pad.color];
                    }
                };
            }

            // Atualiza o display
            display.textContent = pad.name;
        }

        // Função para feedback visual do pad
        function activatePad(element, pad) {
            // Adiciona a classe de ativação visual (cor e escala)
            element.classList.add('active-pad', 'ring-4', 'ring-opacity-50');
            element.style.backgroundColor = pad.color;
            // mantém borda consistente com a cor
            element.style.border = '2px solid ' + (pad.color || 'transparent');
            element.classList.remove('bg-pad-base', 'hover:bg-pad-hover');

            // Remove a classe de ativação após um curto período de tempo
            setTimeout(() => {
                element.classList.remove('active-pad', 'ring-4', 'ring-opacity-50');
                // Restaura a cor/borda do pad (não limpar) para manter a seleção do usuário
                if (pad && pad.color) {
                    element.style.backgroundColor = pad.color;
                    element.style.border = '2px solid ' + pad.color;
                } else {
                    element.style.backgroundColor = '';
                    element.style.border = '';
                }
                element.classList.add('bg-pad-base', 'hover:bg-pad-hover');
            }, 100);
        }

        // Inicializa o grid de pads
        function setupDrumPads() {
            drumGrid.innerHTML = ''; // Limpa o grid antes de recriar
            updateGridClass();
            drumPads.forEach(pad => {
                // Cria o elemento do botão (pad)
                const padElement = document.createElement('div');
                padElement.id = pad.id;
                padElement.classList.add(
                    'drum-pad', 
                    'bg-pad-base', 
                    'hover:bg-pad-hover', 
                    'rounded-xl', 
                    'p-4', 
                    'aspect-square', 
                    'flex', 
                    'flex-col', 
                    'justify-center', 
                    'items-center', 
                    'cursor-pointer',
                    'active:scale-95',
                    'relative'
                );
                padElement.setAttribute('data-key', pad.key);
                padElement.setAttribute('data-name', pad.name);

                // Conteúdo do pad (Tecla e Nome do Som)
                padElement.innerHTML = `
                    <span class="text-3xl font-bold">${pad.key}</span>
                    <span class="text-xs mt-1 text-gray-300">${pad.name}</span>
                `;

                // Cria o elemento de áudio (após definir innerHTML para não ser removido por innerHTML reassignment)
                const audioElement = document.createElement('audio');
                audioElement.id = `audio-${pad.key}`;
                audioElement.src = pad.audioSrc || '';
                audioElement.volume = (pad.volume != null) ? pad.volume : 1;
                padElement.appendChild(audioElement);

                // Aplica a cor ao pad (background e borda)
                if (pad.color) {
                    padElement.style.backgroundColor = pad.color;
                    padElement.style.border = '2px solid ' + pad.color;
                } else {
                    padElement.style.backgroundColor = '';
                    padElement.style.border = '';
                }

                // Botão de editar
                const editButton = document.createElement('button');
                editButton.innerHTML = '&#9998;'; // pencil icon
                editButton.classList.add('absolute', 'top-2', 'right-2', 'text-white');
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditModal(pad);
                });
                padElement.appendChild(editButton);


                // Adiciona listener para clique/toque
                padElement.addEventListener('click', () => {
                    playSound(pad);
                    activatePad(padElement, pad);
                });

                // Permite drop de áudio arrastado da biblioteca
                padElement.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    padElement.classList.add('ring-2');
                });
                padElement.addEventListener('dragleave', () => {
                    padElement.classList.remove('ring-2');
                });
                padElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    padElement.classList.remove('ring-2');
                    const audioId = e.dataTransfer.getData('text/plain');
                    const item = audioLibrary.find(a => a.id === audioId);
                    if (item) {
                        pad.audioSrc = item.src;
                        pad.volume = (pad.volume != null) ? pad.volume : 1;
                        savePads();
                        setupDrumPads();
                    }
                });

                // Adiciona o pad ao grid
                drumGrid.appendChild(padElement);
            });
        }

        function openEditModal(pad) {
            editPadId.value = pad.id;
            editName.value = pad.name;
            editKey.value = pad.key;
            // Se a cor não estiver definida ou não for uma das opções, defina como azul por padrão
            try {
                const options = Array.from(editColor.options).map(o => o.value.toLowerCase());
                editColor.value = options.includes((pad.color || '').toLowerCase()) ? pad.color : '#2563eb';
            } catch (e) {
                editColor.value = pad.color || '#2563eb';
            }
            editAudio.value = pad.audioSrc;
            editVolume.value = (pad.volume != null) ? pad.volume : 1;
            editModal.classList.remove('hidden');
        }

        function closeEditModal() {
            editModal.classList.add('hidden');
        }

        addPadButton.addEventListener('click', () => {
            const newPad = { 
                key: 'NEW', 
                id: `pad-${Date.now()}`,
                name: 'New Pad', 
                color: '#2563eb', // default Azul
                audioSrc: '',
                volume: 1
            };
            drumPads.push(newPad);
            savePads();
            setupDrumPads();
        });

        deletePadButton.addEventListener('click', () => {
            const id = editPadId.value;
            const padIndex = drumPads.findIndex(p => p.id === id);
            if (padIndex > -1) {
                drumPads.splice(padIndex, 1);
                savePads();
                setupDrumPads();
                closeEditModal();
            }
        });

        increaseSizeButton.addEventListener('click', () => {
            if (gridCols > 1) {
                gridCols--;
                saveGridCols();
                updateGridClass();
            }
        });

        decreaseSizeButton.addEventListener('click', () => {
            if (gridCols < 6) {
                gridCols++;
                saveGridCols();
                updateGridClass();
            }
        });

        cancelEdit.addEventListener('click', closeEditModal);

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = editPadId.value;
            const padIndex = drumPads.findIndex(p => p.id === id);
            if (padIndex > -1) {
                drumPads[padIndex] = {
                    ...drumPads[padIndex],
                    name: editName.value,
                    key: editKey.value.toUpperCase(),
                    color: editColor.value,
                    audioSrc: editAudio.value,
                    volume: parseFloat(editVolume.value)
                };
                savePads();
                setupDrumPads();
                closeEditModal();
            }
        });

        // Listener para o teclado
        document.addEventListener('keydown', (event) => {
            // Converte a tecla pressionada para maiúscula
            const key = event.key.toUpperCase();
            
            // Encontra o pad correspondente
            const padData = drumPads.find(p => p.key === key);

            if (padData) {
                // Previne que a tecla afete outras coisas (como o scroll)
                event.preventDefault(); 
                
                const padElement = document.getElementById(padData.id);
                
                // Verifica se o pad já está ativo para evitar repetição no keydown (somente toque o som e ative uma vez)
                if (padElement && !padElement.classList.contains('active-pad')) {
                    playSound(padData);
                    activatePad(padElement, padData);
                }
            }
        });
        
        // Inicia a aplicação quando a janela carregar
        window.onload = () => {
            loadPads();
            setupDrumPads();
            renderAudioLibrary();
            loadTracks();
            renderTracks();
        };
