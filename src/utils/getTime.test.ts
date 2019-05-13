import getTime from "./getTime";

test("should return number from string Date with UTC", () => {
  const testData: string = "2019-04-22T21:43:53.000Z";
  expect(getTime(testData)).toEqual(1555969433000);
});

test("should return number from string without UTC", () => {
  const testData: string = "2019-04-22 21:43:53.000";
  expect(getTime(testData)).toEqual(1555955033000);
});

test("should return number from string with Wazuh date format", () => {
  const testData: string = "Tue Apr 22 21:43:53 UTC 2019";
  expect(getTime(testData)).toEqual(1555969433000);
});

test("should return number from Date with UTC", () => {
  const testData: Date = new Date("2019-04-22T21:43:53.000Z");
  expect(getTime(testData)).toEqual(1555969433000);
});

test("should return undefined from undefined", () => {
  const testData = undefined;
  expect(getTime(testData)).toEqual(undefined);
});
