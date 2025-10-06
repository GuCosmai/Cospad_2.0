CosPad
=======

Seu estúdio de música na web — um drum pad e pequena DAW (biblioteca, faixas, export/import).

O que tem aqui
- `index.html`, `index.js`, `style.css` — app frontend puro (sem build).
- Biblioteca de áudio com upload/drag-and-drop.
- Pads personalizáveis (nome, tecla, cor, volume, áudio).
- Faixas com controles (play/pause, volume, loop) e visualização de waveform.
- Export/Import de projeto (JSON) e salvamento local.

Como usar localmente
1. Abra o arquivo `index.html` no navegador (duplo clique) — não precisa de servidor, mas usar um servidor local é opcional.
2. Use a coluna "Biblioteca de Áudio" para arrastar arquivos do seu PC ou carregar pela caixa de arquivos.
3. Crie pads na coluna "Opções" e arraste áudios para eles; edite pressionando ✎.
4. Use "Faixas" para compor linhas de áudio, ajustar volume e loop.

Instruções rápidas para adicionar este projeto ao GitHub (PowerShell)
1. Abra PowerShell na pasta do projeto:

```powershell
# navegue até a pasta do projeto
cd "C:\Users\Lenovo\Desktop\gustavo\projeto\cospad 2.0"

# configure seu usuário (se ainda não estiver configurado)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# inicialize git, adicione arquivos e commit
git init
git add .
git commit -m "Initial commit: CosPad"
```

2a opção (recomendada: usar o GitHub CLI se estiver instalado):

```powershell
# cria repositório no GitHub, adiciona remote e faz push (pode pedir login)
gh repo create cos-pad --public --source=. --remote=origin --push
```

2b opção (manual via GitHub Web):
- Vá para https://github.com/new e crie um novo repositório (nome por ex. `cospad`).
- Depois execute (substitua URL):

```powershell
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
git branch -M main
git push -u origin main
```

Observações
- Se você exportou áudios como dataURL (upload local), o JSON exportado fica grande — evite enviar por e-mail grandes arquivos JSON.
- Se preferir, posso configurar um `README.md` mais detalhado, um `LICENSE` ou um `package.json` (se quiser adicionar ferramentas).

Problemas comuns
- Autenticação HTTPS: se solicitado, crie um Personal Access Token no GitHub (scopes: repo) e use-o como senha quando solicitado.
- Se usar SSH, adicione sua chave pública no GitHub e use URL SSH no `git remote add`.

Se quiser, eu:
- Posso criar o repositório automaticamente (se você me der instruções para usar `gh` aqui ou me der um token — não recomendado compartilhar token aqui). 
- Posso adicionar um `LICENSE` (MIT) e um `CONTRIBUTING.md`.

Bom trabalho — diga se quer que eu gere o `LICENSE` e/ou um `README` com instruções de deploy/host mais completas.
