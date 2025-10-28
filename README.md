# 🚀 Gasless NFT Mint – Arquitetura Completa

Projeto full stack com **mint gratuito de NFTs** usando **assinatura off-chain + relayer** para pagar o gas.  
O usuário assina uma mensagem fora da blockchain, o backend (relayer) valida e envia a transação para o contrato inteligente, que cunha o NFT na **Sepolia Testnet**.

---

## 📚 Sumário
1. [Visão geral](#visão-geral)
2. [Arquitetura de pastas](#arquitetura-de-pastas)
3. [Fluxo completo](#fluxo-completo)
4. [Componentes do sistema](#componentes-do-sistema)
5. [Tecnologias usadas](#tecnologias-usadas)
6. [Ambiente e variáveis](#ambiente-e-variáveis)
7. [Como executar](#como-executar)
8. [Docker Compose](#docker-compose)
9. [Scripts auxiliares](#scripts-auxiliares)
10. [Boas práticas e segurança](#boas-práticas-e-segurança)
11. [Próximos passos](#próximos-passos)

---

## ⚙️ Visão geral

**Objetivo:** permitir que usuários mintem NFTs **sem pagar gas**.  
A transação é paga por um **relayer** (servidor backend), enquanto a assinatura do usuário garante autenticidade e autorização.

**Fluxo básico:**

\`\`\`
[Usuário acessa site]
        ↓
Conecta carteira MetaMask
        ↓
Assina mensagem off-chain (EIP-712)
        ↓
Backend recebe assinatura e valida
        ↓
Relayer envia transação para Sepolia (paga gas)
        ↓
Contrato valida assinatura e faz mint
        ↓
Usuário recebe NFT no endereço
\`\`\`

---

## 🧱 Arquitetura de pastas

\`\`\`
nft-gasless-mint/
│
├── contracts/
│   ├── contracts/
│   │   ├── AccessNFTGasless.sol
│   │   └── utils/
│   │       └── VerifySignature.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── verify.js
│   ├── hardhat.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   └── mintRoute.js
│   │   ├── services/
│   │   │   ├── ethersProvider.js
│   │   │   └── verifySignature.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── middlewares/
│   │       └── errorHandler.js
│   ├── .env
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── WalletConnect.jsx
│   │   │   ├── MintButton.jsx
│   │   │   └── StatusMessage.jsx
│   │   ├── hooks/
│   │   │   └── useWallet.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── signature.js
│   │   │   └── constants.js
│   │   └── styles/
│   │       └── index.css
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
├── .env.example
├── docker-compose.yml
└── scripts/
    ├── init.sh
    └── start-dev.sh
\`\`\`

---

## 🔗 Fluxo completo

1. Usuário acessa o **frontend (React)**.  
2. Conecta a **MetaMask**.  
3. O frontend solicita um **nonce** e gera uma **assinatura off-chain**.  
4. O frontend envia `{to, nonce, deadline, signature}` para o **backend**.  
5. O backend:
   - Valida a assinatura.
   - Usa o **relayer** (carteira do servidor) para chamar `mintWithSignature()` no contrato.
6. O **contrato inteligente** verifica assinatura e nonce.
7. O NFT é **mintado para o usuário**.
8. O backend retorna o hash da transação e o frontend exibe sucesso.

---

## 🧩 Componentes do sistema

### 1️⃣ Smart Contract (`AccessNFTGasless.sol`)
- Baseado em **ERC721 (OpenZeppelin)**.  
- Permite **mint com assinatura off-chain**.  
- Usa `ECDSA` para validar que o dono da carteira assinou o pedido.  
- Controle de `nonces` e `deadline` para evitar replay.  
- Whitelist de **relayers autorizados**.

### 2️⃣ Backend
- Framework: **Express.js**.  
- Funções:
  - Recebe requisições de mint.
  - Verifica assinatura (EIP-712 / ECDSA).
  - Interage com contrato na Sepolia via `ethers.js`.
  - Paga o gas da transação.
- Configuração via `.env`.

### 3️⃣ Frontend
- Framework: **React + Vite + Tailwind**.  
- Funções:
  - Conexão com MetaMask.
  - Assinatura off-chain (`signTypedData`).
  - Comunicação com backend (`axios`).
  - Feedback visual para o usuário.

---

## 🧰 Tecnologias usadas

| Camada | Stack |
|--------|--------|
| Blockchain | Solidity + Hardhat + OpenZeppelin |
| Backend | Node.js + Express + ethers.js |
| Frontend | React + Vite + Tailwind + ethers.js |
| Infra | Docker + docker-compose |
| Rede | Sepolia Testnet (Alchemy ou Infura) |

---

## 🔐 Ambiente e variáveis

### Arquivo `.env` no backend:
\`\`\`bash
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/SEU_API_KEY
RELAYER_PRIVATE_KEY=CHAVE_PRIVADA_DO_RELAYER
CONTRACT_ADDRESS=0xSEU_CONTRATO
PORT=3001
\`\`\`

---

## 🚀 Como executar

### 1. Instalar dependências
\`\`\`bash
# Windows PowerShell
.\scripts\init.ps1
\`\`\`

### 2. Configurar variáveis de ambiente
- Copie `.env.example` para `backend/.env`
- Preencha com suas credenciais

### 3. Deploy do contrato
\`\`\`bash
cd contracts
npm run deploy
\`\`\`

### 4. Iniciar servidores
\`\`\`bash
# Modo desenvolvimento
.\scripts\start-dev.ps1

# Ou com Docker
docker-compose up
\`\`\`

---

## 🐳 Docker Compose

\`\`\`bash
docker-compose up --build
\`\`\`

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 🔒 Boas práticas e segurança

- ✅ Nunca exponha chaves privadas no frontend
- ✅ Use variáveis de ambiente para configurações sensíveis
- ✅ Valide assinaturas no contrato e no backend
- ✅ Implemente rate limiting no backend
- ✅ Use nonces para prevenir replay attacks
- ✅ Configure deadlines para expiração de assinaturas
- ✅ Mantenha whitelist de relayers autorizados

---

## 📝 Próximos passos

- [ ] Implementar sistema de filas para mint em massa
- [ ] Adicionar suporte para múltiplas redes
- [ ] Criar dashboard administrativo
- [ ] Implementar testes unitários e integração
- [ ] Adicionar monitoramento e alertas
- [ ] Otimizar custos de gas
- [ ] Implementar IPFS para metadados

---

## 📄 Licença

MIT

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.
