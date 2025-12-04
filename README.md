# 📘 Criador de Campos Personalizados para Bitrix24

Uma aplicação simples e poderosa para **criar campos personalizados em massa** no CRM do Bitrix24 usando a API REST.  
Ideal para integrações, automações e implantação rápida de estruturas de dados complexas.

---

## 🚀 Funcionalidades

- Criar múltiplos campos personalizados de uma só vez
- Suporte às entidades:
  - **Leads**
  - **Negócios (Deals)**
  - **Contatos**
  - **Empresas**
- Tipos de campo suportados:
  - Texto (`string`)
  - Número inteiro (`integer`)
  - Decimal (`double`)
  - Arquivo (`file`)
  - Sim/Não (`boolean`)
  - Lista (`enumeration`)
- Sanitização automática do nome interno `FIELD_NAME`:
  - Remove acentos
  - Substitui espaços por `_`
  - Permite apenas caracteres válidos (A–Z, 0–9, `_`)
- Numeração automática dos campos:
  ```
  NF (1)
  NF (2)
  NF (3)
  ```
- Log detalhado exibindo:
  - URL da requisição
  - Payload enviado
  - Status HTTP
  - Resposta da API

---

## 🧩 Como funciona

A aplicação lê o **webhook completo** do Bitrix24 e extrai:

- **API_URL:**  
  ```
  https://empresa.bitrix24.com.br/rest
  ```

- **TOKEN:**  
  ```
  USER_ID/CHAVE
  ```

Mapeamento de entidades:

| Entidade | Código interno | Endpoint usado |
|----------|----------------|----------------|
| Leads | `lead` | `crm.lead.userfield.add` |
| Negócios | `deal` | `crm.deal.userfield.add` |
| Contatos | `contact` | `crm.contact.userfield.add` |
| Empresas | `company` | `crm.company.userfield.add` |

Formato final da URL:

```
{API_URL}/{TOKEN}/{ENDPOINT}.json
```

---

## 🔧 Como usar

1. Abra o aplicativo  
2. Cole o webhook completo do Bitrix24  
3. Preencha:
   - Nome base do campo  
   - Quantidade  
   - Entidade de destino  
   - Tipo do campo  
   - (Opcional) Opções de lista  
4. Clique em **Criar campos**  
5. Veja o log detalhado  
6. Verifique os novos campos no CRM do Bitrix24  

---

## 🗃️ Exemplo de `FIELD_NAME` gerado

Entrada:
```
Nome base: Arquivo NF
Entidade: Negócios
```

Saída sanitizada:
```
ARQUIVO_NF
```

Nome final:
```
UF_CRM_DEAL_ARQUIVO_NF_001
```

---

## 🧼 Sanitização do nome interno

Processo aplicado:

- Remove acentos  
- Troca espaços por `_`  
- Remove caracteres inválidos  

Exemplo:

```
Entrada: "Arquivo Fiscal 2024"
Saída:   ARQUIVO_FISCAL_2024
```

---

## 📡 Estrutura da requisição enviada

```json
{
  "fields": {
    "FIELD_NAME": "UF_CRM_DEAL_ARQUIVO_NF_001",
    "EDIT_FORM_LABEL": "Arquivo NF (1)",
    "LIST_COLUMN_LABEL": "Arquivo NF (1)",
    "USER_TYPE_ID": "string",
    "MULTIPLE": "N"
  }
}
```

---

## 🏗️ Estrutura do Projeto

```
/CriadorDeCampos
 ├── BitrixFieldCreator.csproj
 ├── Program.cs
 ├── MainForm.cs
 └── MainForm.Designer.cs
```

---

## 🛠️ Como gerar o executável (standalone)

Execute:

```bash
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o publish
```

Executável final:

```
publish/CriadorDeCampos.exe
```

---

## ⚠️ Limitações

- Não edita ou remove campos existentes  
- Não altera layout do CRM  
- Requer webhook com permissão completa em CRM  

---

## 📄 Licença

Uso livre para equipes e consultorias integradas ao Bitrix24.
