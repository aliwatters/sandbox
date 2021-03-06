const add = (a: number, b: number): number => {
  return a + b;
};

// We're going to use explicit return types -- because
const subtract = (a: number, b: number) => {
  // missed return! inference doesn't catch
  a - b;
};

function divide(a: number, b: number): number {
  return a / b;
}

const multiply = function (a: number, b: number): number {
  return a * b;
};

const logger = (message: string): void => {
  console.log(message);
  // return ''; // error!
};

const throwError = (message: string): never => {
  throw new Error(message); // func doesn't complete -- hence never.
};

// destructuring
const todaysWeather = {
  date: new Date(),
  weather: 'sunny',
};

const logWeather = ({
  date,
  weather,
}: {
  date: Date;
  weather: string;
}): void => {
  console.log(date, weather);
};

logWeather(todaysWeather);
