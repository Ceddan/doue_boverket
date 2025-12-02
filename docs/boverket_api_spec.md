# AZU001 Energideklarationer
**Version:** 1.0

Boverkets publika API för energideklarationer

## Base URLs
- `https://api.boverket.se/energideklarationer`

## Authentication
### apiKeyHeader
- **Type:** apiKey
- **Name:** `Ocp-Apim-Subscription-Key`
- **In:** header
### apiKeyQuery
- **Type:** apiKey
- **Name:** `subscription-key`
- **In:** query

## Endpoints
### GET /
**Summary:** Hämta energideklaration

**Operation ID:** `get-energy-declaration`

#### Parameters
| Name | In | Required | Description | Schema |
|------|----|----------|-------------|--------|
| `kommun` | query | **Yes** | Ange kommun (obligatorisk uppgift) | string |
| `fastighetsbeteckning` | query | No | Ange fastighetsbeteckning (obligatorisk uppgift om inte adress anges) | string |
| `adress` | query | No | Ange gatuadress (obligatorisk uppgift om inte fastighetsbeteckning anges) | string |

#### Responses
- **200**: 
- **400**: 
- **401**: 
- **403**: 
- **404**: 
- **429**: 
- **503**: 

---
