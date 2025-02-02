# Currency Exchange API

A robust REST API service that provides real-time and historical currency exchange rates with Redis caching for optimal performance.

## Features

- Real-time currency conversion rates
- Historical exchange rates data
- Support for 200+ currencies and cryptocurrencies
- Redis caching for improved performance
- RESTful API endpoints
- CORS-enabled for cross-origin requests

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- Redis server (v6 or higher)
- npm or yarn package manager

## Quick Start

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd currency-exchange-api/server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```
   PORT=3000
   REDIS_URL=redis://localhost:6379
   ```

4. Start the server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## API Endpoints

### Convert Currency
POST `/exchange`
```json
{
  "from": "USD",
  "to": ["EUR", "GBP"],
  "amount": 100,
  "date": "2023-11-20"  // optional, defaults to current date
}
```

### Get Historical Rates
GET `/history?base=USD&target=EUR,GBP&start=2023-11-01&end=2023-11-20`

## Response Examples

### Exchange Response
```json
{
  "results": [
    {
      "currency": "EUR",
      "result": 91.85
    },
    {
      "currency": "GBP",
      "result": 79.54
    }
  ]
}
```

### Historical Rates Response
```json
{
  "2023-11-20": {
    "date": "2023-11-20",
    "rates": [
      {
        "from": "USD",
        "to": "EUR",
        "rate": 0.9185
      },
      {
        "from": "USD",
        "to": "GBP",
        "rate": 0.7954
      }
    ]
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful request
- 400: Bad request (invalid parameters)
- 500: Server error

## Cache Strategy

- Exchange rates are cached in Redis for 1 hour
- Historical rates are cached for 30 days
- Cache keys format: `exchange_rates_${base}_${date}`

## Development

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
