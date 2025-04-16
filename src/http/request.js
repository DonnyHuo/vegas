import { request } from "graphql-request";

import { store } from "../store";

export const fetchData = async (data) => {
  const version = store.getState().version;
  const endpoint =
    version === 2
      ? "https://gateway.thegraph.com/api/subgraphs/id/H47Rbtgf4wSXUYSXJCQghojAW2PVwHdgBht41ukXnN5x"
      : version === 3
      ? "https://gateway.thegraph.com/api/subgraphs/id/A6resAWaXr7koffpoqWmqfbqtg4QLtVBN2otxNC5dfk"
      : "https://api.studio.thegraph.com/query/84515/stakingreward/version/latest";
  return request(endpoint, data, undefined, {
    Authorization: "Bearer 15e21550a1f515dd302fe54bf5635a40"
  });
};
