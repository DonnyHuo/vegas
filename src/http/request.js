import { request } from "graphql-request";

import { store } from "../store";

export const fetchData = async (data) => {
  const version = store.getState().version;
  const endpoint =
    version === 2
      ? "https://api.studio.thegraph.com/query/84515/stakingrewardv2/v0.0.2"
      : "https://api.studio.thegraph.com/query/84515/stakingreward/version/latest";
  return request(endpoint, data);
};
