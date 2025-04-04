import { request } from "graphql-request";

import { store } from "../store";

export const fetchData = async (data) => {
  const version = store.getState().version;
  const endpoint =
    version === 2
      ? "https://api.studio.thegraph.com/query/84515/stakingrewardv2/version/latest"
      : version === 3
      ? "https://api.studio.thegraph.com/query/84515/stakingrewardv3/version/latest"
      : "https://api.studio.thegraph.com/query/84515/stakingreward/version/latest";
  return request(endpoint, data);
};
