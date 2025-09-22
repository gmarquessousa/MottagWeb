# Editor de Mapas (Flask)

Aplicação Flask (Python 3.10) com Google Maps para:
- Pesquisa de endereço (Places Autocomplete)
- Visualização do endereço no mapa
- Marcação de pontos para medir perímetro e área (Google Maps Geometry)
- Download de imagem do mapa com o polígono (Google Static Maps)

> As imagens (logos/ícones) podem ser adicionadas em `static/img/`.

## Requisitos
- Python 3.10
- Chave de API do Google Maps com Maps JavaScript API, Places API e Maps Static API habilitadas.

## Configuração
1. Crie o arquivo `.env` na raiz com:
   ```env
   GOOGLE_MAPS_API_KEY=coloque_sua_chave_aqui
   SECRET_KEY=change-me
   FLASK_ENV=development
   FLASK_DEBUG=1
   ```
2. (Opcional) Crie e ative o ambiente virtual e instale dependências:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

## Executar
```powershell
# No diretório do projeto
.\.venv\Scripts\Activate.ps1
python wsgi.py
```
Acesse: http://127.0.0.1:5000/

## Como usar
- Pesquise um endereço na caixa de busca e selecione.
- Clique no mapa para adicionar pontos do contorno. O perímetro e a área serão atualizados.
- "Remover marcação" remove o último ponto.
- Clique em "Baixar imagem" para gerar a imagem com o polígono.
- Dica: quando o botão "Adicionar antena" estiver ativo, um clique com o botão direito adiciona um marcador no local (exemplo de antena).

## Observação
- Sem uma chave válida, o mapa não funcionará. Garanta que as três APIs citadas estejam habilitadas.
