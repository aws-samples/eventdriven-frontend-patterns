import { differenceInMilliseconds } from "date-fns";

function compareFlights(a, b) {
  // prefer sort by destination
  if (a.dest < b.dest) return -1;
  if (a.dest > b.dest) return 1;

  // then by airline code
  if (a.airlineCode < b.airlineCode) return -1;
  if (a.airlineCode > b.airlineCode) return 1;

  return 0;
};

function formatDeliveryDelay(updatedAt, received) {
  const receivedDate = received ? received : Date.now();
  const milliseconds = Math.abs(differenceInMilliseconds(updatedAt, receivedDate));
  const seconds = Math.floor(milliseconds / 1000);
  const msLeftover = milliseconds % 1000;
  return `${seconds}.${msLeftover}s`;
};

export {
  compareFlights,
  formatDeliveryDelay
}