/**
 * @jest-environment jsdom
 */

import { TRUE } from "node-sass";
import { checkForDuplicateItem } from "../src/client/scripts/app";

describe("Create Trip", () => {
  test("A trip should be returned with all informations", () => {
    const list = document.createElement("ul");
    const item1 = document.createElement("li");
    const item2 = document.createElement("li");
    const item3 = document.createElement("li");

    item1.innerHTML = "Hat";
    item2.innerHTML = "Shoes";
    item3.innerHTML = "Jacket";

    list.appendChild(item1);
    list.appendChild(item2);
    list.appendChild(item3);

    const input = {
      item: "Glasses",
      list: list,
    };

    const output = true;

    expect(checkForDuplicateItem(input.list, input.item)).toEqual(output);
  });

  test("A trip should be returned with all informations", () => {
    const list = document.createElement("ul");
    const item1 = document.createElement("li");
    const item2 = document.createElement("li");
    const item3 = document.createElement("li");

    item1.innerHTML = "Hat";
    item2.innerHTML = "Shoes";
    item3.innerHTML = "Jacket";

    list.appendChild(item1);
    list.appendChild(item2);
    list.appendChild(item3);

    const input = {
      item: "Hat",
      list: list,
    };

    const output = false;

    expect(checkForDuplicateItem(input.list, input.item)).toEqual(output);
  });
});
