📘 README – Criador de Campos Personalizados para Bitrix24
🧩 Descrição do Projeto

O Criador de Campos Bitrix24 é uma aplicação desenvolvida para automatizar a criação em massa de campos personalizados (userfields) no CRM do Bitrix24.
Em vez de criar cada campo manualmente dentro do painel do Bitrix, o sistema envia requisições REST para gerar dezenas ou centenas de campos de forma padronizada, rápida e segura.

Ele suporta:

Leads

Negócios (Deals)

Contatos

Empresas

E diversos tipos de campos:

Texto

Número

Decimal

Arquivo

Sim/Não

Lista (com opções personalizadas)

O projeto foi feito para equipes que precisam criar estruturas grandes de forma consistente—como integrações, ETLs, automações e sistemas externos espelhados no Bitrix24.

🚀 Principais Funcionalidades

Criar múltiplos campos personalizados de uma só vez

Nomeação automática com numeração incremental:

NF (1)
NF (2)
NF (3)


Geração do FIELD_NAME seguindo as exigências do Bitrix24:

Sem acentos

Sem espaços

Apenas A–Z, 0–9 e _

Exemplo:

UF_CRM_DEAL_NF_001


Suporte completo a campos do tipo Lista (enumeration)

Log detalhado exibindo:

URL da requisição

Payload enviado

Status HTTP

Resposta completa da API

Separação automática do API_URL e TOKEN a partir do webhook completo do Bitrix24

🏗️ Arquitetura

O projeto é composto por:

MainForm.cs — lógica principal, regras de montagem do payload, sanitização e requisições HTTP

MainForm.Designer.cs — definição da interface gráfica

Program.cs — inicialização da aplicação Windows Forms

.csproj — configuração do projeto e referência ao Newtonsoft.Json

🔧 Requisitos

Windows 10 ou superior

.NET 6

Permissão no Bitrix24 para criar campos personalizados

Webhook do Bitrix24 com permissões completas de CRM

Webhook deve ser no formato:

https://empresa.bitrix24.com.br/rest/USER_ID/TOKEN/

💡 Como Usar

Abra o aplicativo Criador de Campos

Cole o webhook completo do Bitrix24

Informe:

Nome base do campo

Quantidade de campos

Entidade de destino

Tipo de campo

Opções (caso seja Lista)

Clique em Criar Campos

Acompanhe o log detalhado no rodapé

Verifique os novos campos no CRM do Bitrix24

📡 Como Funcionam as Requisições

O Bitrix24 utiliza endpoints diferentes para cada entidade:

Entidade	Endpoint
Lead	crm.lead.userfield.add
Deal	crm.deal.userfield.add
Contact	crm.contact.userfield.add
Company	crm.company.userfield.add

O sistema constrói automaticamente:

{API_URL}/{TOKEN}/{ENDPOINT}.json


Exemplo real:

https://empresa.bitrix24.com.br/rest/163/abc123xyz/crm.deal.userfield.add.json

🧼 Sanitização do FIELD_NAME

Para atender às regras rígidas do Bitrix24, o nome interno é convertido para o formato:

A-Z somente

Espaços viram _

Acentos são removidos

Caracteres inválidos são eliminados

Exemplo:

Entrada: "Arquivo da Fatura"
Saída:   ARQUIVO_DA_FATURA


Nome final gerado:

UF_CRM_DEAL_ARQUIVO_DA_FATURA_001

🗂️ Estrutura de Arquivos
/CriadorDeCampos
 ├── BitrixFieldCreator.csproj
 ├── Program.cs
 ├── MainForm.cs
 └── MainForm.Designer.cs

🛠️ Construindo o Executável

O projeto pode ser publicado como:

✔ Standalone (não precisa instalar .NET no PC do usuário)
✔ Single File (um único .exe)

Comando CLI recomendado:

dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o publish


O executável final ficará em:

publish/CriadorDeCampos.exe


Esse EXE funciona em qualquer computador Windows, mesmo sem .NET instalado.

🛡️ Limitações

Apenas cria campos (não lista, edita ou remove)

Depende do Bitrix24 aceitar o webhook enviado

Usuários sem permissão de CRM não conseguem criar campos

Campos criados não podem ser automaticamente reorganizados no layout do Bitrix24

📄 Licença

Livre para uso interno de equipes e consultores que trabalham com integrações Bitrix24.
