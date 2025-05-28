# 📱 Vizinho Agro App

Aplicativo mobile desenvolvido com Expo e React Native para conectar produtores locais a consumidores, com foco em geolocalização, filtros inteligentes e acessibilidade rural.

## 📦 Tecnologias Principais

- **Expo** – ambiente de desenvolvimento para React Native
- **React Native** – desenvolvimento mobile cross-platform
- **TypeScript** – tipagem estática
- **React Hook Form** – gerenciamento de formulários
- **AsyncStorage** – persistência local
- **React Context API** – gerenciamento de estado global
- **Map Clustering e Localização** – geolocalização para exibir produtores

---

## 📁 Estrutura de Pastas

src/
├── app/
│ ├── (farmer)/ → Páginas do produtor
│ └── (consumer)/ → Páginas do consumidor
├── components/ → Componentes reutilizáveis
├── contexts/ → Estados globais
├── services/ → Integração com API
├── assets/ → Imagens e logos

---

## 🚀 Funcionalidades

### Para Produtores:
- Cadastro e login com telefone/senha
- Gerenciamento de perfil
- Cadastro de produtos com imagens e descrições
- Visualização de métricas
- Localização geográfica no mapa

### Para Consumidores:
- Exploração de produtores por mapa
- Filtros por distância, tipo de produto, e gênero do produtor
- Listagem e detalhes de produtos
- Carrinho de compras

---

## ⚙️ Scripts Disponíveis

```bash
# Inicia o app no Expo Go
npx expo start

# Inicia o app diretamente no Android
npm run android

# Inicia o app diretamente no iOS (MacOS)
npm run ios

# Inicia versão web (Expo Web)
npm run web

# Executa o lint
npm run lint

# Reseta o projeto (custom script)
npm run reset-project

```
---
## 🌐 Backend

### O backend utiliza:
- Fastify
- PostgreSQL
- Drizzle ORM
- Zod
- Typescript

O repositório encontra-se em:[vizinho-agro-api](https://github.com/jefferson-gbarbosa/vizinho-agro-api)

---

## 💡 Contribuição

1. Faça um fork do projeto

2. Crie sua branch: git checkout -b minha-feature

3. Commit suas alterações: git commit -m 'feat: minha nova funcionalidade'

4. Faça push da branch: git push origin minha-feature

5. Abra um Pull Request ✅

---

## 📜 Licença

Este projeto é licenciado sob a MIT License.

---

## ✍️ Autoria

Projeto desenvolvido como parte de uma iniciativa de extensão universitária com foco em soluções tecnológicas para o comércio e a agricultura familiar.