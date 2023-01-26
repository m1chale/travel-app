import { handleRequest, server } from "../src/server/server";

describe("Create Trip with sorted locations", () => {
  test("A trip should be returned with all informations", () => {
    const input = {
      packagingList: ["Hat", "Shoes", "Jacket"],
      locations: [{ startDate: "2023-04-12" }, { startDate: "2023-03-22" }],
    };

    const output = {
      locations: [{ startDate: "2023-03-22" }, { startDate: "2023-04-12" }],
      packagingList: ["Hat", "Shoes", "Jacket"],
    };

    expect(handleRequest(input)).toMatchObject(output);

    server.close();
  });
});
