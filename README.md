# 📱 Vizinho Agro App

Aplicativo mobile desenvolvido com Expo e React Native para conectar produtores locais a consumidores, com foco em geolocalização, filtros inteligentes e acessibilidade rural.

## 🚀 Tecnologias Principais

- **Expo** – ambiente de desenvolvimento para React Native
- **React Native** – desenvolvimento mobile cross-platform
- **TypeScript** – tipagem estática
- **React Hook Form** – gerenciamento de formulários
- **AsyncStorage** – persistência local
- **React Context API** – gerenciamento de estado global
- **Map Clustering e Localização** – geolocalização para exibir produtores

## 📁 Estrutura de Pastas

src/
├── app/ # Entrypoints de telas, rotas e navegação
├── assets/ # Imagens, ícones e outros recursos estáticos
├── components/ # Componentes reutilizáveis
├── contexts/ # Contextos React para estado global
├── services/ # Lógica de serviços e chamadas à API


## ⚙️ Scripts Disponíveis

```bash
# Inicia o app no Expo Go
npm start

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
