# Will My Flight Be Late?

A simple, user-friendly web application that predicts flight delays using free, publicly available data sources.

## Features

- Real-time flight delay predictions
- Weather impact analysis
- Gate information
- Historical delay patterns
- Mobile-responsive design

## Tech Stack

- React
- Tailwind CSS
- OpenSky Network API (flight data)
- National Weather Service API (weather data)
- Bureau of Transportation Statistics (historical data)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/NT710/willmyflightbelate.git
```

2. Install dependencies:
```bash
cd willmyflightbelate
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Project Structure

```
willmyflightbelate/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── FlightDelayPredictor.jsx
│   └── App.js
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
