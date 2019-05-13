import getTime from "./getTime";

test("should return number from string Date with UTC", () => {
  const testData: string = "2019-04-22T21:43:53.000Z";
  expect(getTime(testData)).toEqual(1555969433000);
});

test("should return number with UTC from string without UTC", () => {
  const testData: string = "2019-04-22 21:43:53";
  expect(getTime(testData)).toEqual(1555969433000);
});

test("should return zero number from started date string without UTC", () => {
  const testData: string = "1970-01-01 00:00:00";
  expect(getTime(testData)).toEqual(0);
});

test("should return number with UTC from string with Wazuh date format", () => {
  const testData: string = "Tue Apr 22 21:43:53 2019";
  expect(getTime(testData)).toEqual(1555969433000);
});

test("should return undefined from undefined", () => {
  const testData = undefined;
  expect(getTime(testData)).toEqual(undefined);
});
